'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');
var linkifyjs = require('linkifyjs');
var state = require('@tiptap/pm/state');

function autolink(options) {
    return new state.Plugin({
        key: new state.PluginKey('autolink'),
        appendTransaction: (transactions, oldState, newState) => {
            const docChanges = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc);
            const preventAutolink = transactions.some(transaction => transaction.getMeta('preventAutolink'));
            if (!docChanges || preventAutolink) {
                return;
            }
            const { tr } = newState;
            const transform = core.combineTransactionSteps(oldState.doc, [...transactions]);
            const changes = core.getChangedRanges(transform);
            changes.forEach(({ newRange }) => {
                // Now let’s see if we can add new links.
                const nodesInChangedRanges = core.findChildrenInRange(newState.doc, newRange, node => node.isTextblock);
                let textBlock;
                let textBeforeWhitespace;
                if (nodesInChangedRanges.length > 1) {
                    // Grab the first node within the changed ranges (ex. the first of two paragraphs when hitting enter).
                    textBlock = nodesInChangedRanges[0];
                    textBeforeWhitespace = newState.doc.textBetween(textBlock.pos, textBlock.pos + textBlock.node.nodeSize, undefined, ' ');
                }
                else if (nodesInChangedRanges.length
                    // We want to make sure to include the block seperator argument to treat hard breaks like spaces.
                    && newState.doc.textBetween(newRange.from, newRange.to, ' ', ' ').endsWith(' ')) {
                    textBlock = nodesInChangedRanges[0];
                    textBeforeWhitespace = newState.doc.textBetween(textBlock.pos, newRange.to, undefined, ' ');
                }
                if (textBlock && textBeforeWhitespace) {
                    const wordsBeforeWhitespace = textBeforeWhitespace.split(' ').filter(s => s !== '');
                    if (wordsBeforeWhitespace.length <= 0) {
                        return false;
                    }
                    const lastWordBeforeSpace = wordsBeforeWhitespace[wordsBeforeWhitespace.length - 1];
                    const lastWordAndBlockOffset = textBlock.pos + textBeforeWhitespace.lastIndexOf(lastWordBeforeSpace);
                    if (!lastWordBeforeSpace) {
                        return false;
                    }
                    linkifyjs.find(lastWordBeforeSpace)
                        .filter(link => link.isLink)
                        // Calculate link position.
                        .map(link => ({
                        ...link,
                        from: lastWordAndBlockOffset + link.start + 1,
                        to: lastWordAndBlockOffset + link.end + 1,
                    }))
                        // ignore link inside code mark
                        .filter(link => {
                        if (!newState.schema.marks.code) {
                            return true;
                        }
                        return !newState.doc.rangeHasMark(link.from, link.to, newState.schema.marks.code);
                    })
                        // validate link
                        .filter(link => {
                        if (options.validate) {
                            return options.validate(link.value);
                        }
                        return true;
                    })
                        // Add link mark.
                        .forEach(link => {
                        if (core.getMarksBetween(link.from, link.to, newState.doc).some(item => item.mark.type === options.type)) {
                            return;
                        }
                        tr.addMark(link.from, link.to, options.type.create({
                            href: link.href,
                        }));
                    });
                }
            });
            if (!tr.steps.length) {
                return;
            }
            return tr;
        },
    });
}

function clickHandler(options) {
    return new state.Plugin({
        key: new state.PluginKey('handleClickLink'),
        props: {
            handleClick: (view, pos, event) => {
                var _a, _b;
                if (event.button !== 0) {
                    return false;
                }
                const attrs = core.getAttributes(view.state, options.type.name);
                const link = event.target;
                const href = (_a = link === null || link === void 0 ? void 0 : link.href) !== null && _a !== void 0 ? _a : attrs.href;
                const target = (_b = link === null || link === void 0 ? void 0 : link.target) !== null && _b !== void 0 ? _b : attrs.target;
                if (link && href) {
                    if (view.editable) {
                        window.open(href, target);
                    }
                    return true;
                }
                return false;
            },
        },
    });
}

function pasteHandler(options) {
    return new state.Plugin({
        key: new state.PluginKey('handlePasteLink'),
        props: {
            handlePaste: (view, event, slice) => {
                var _a, _b;
                const { state } = view;
                const { selection } = state;
                // Do not proceed if in code block.
                if (state.doc.resolve(selection.from).parent.type.spec.code) {
                    return false;
                }
                let textContent = '';
                slice.content.forEach(node => {
                    textContent += node.textContent;
                });
                let isAlreadyLink = false;
                slice.content.descendants(node => {
                    if (node.marks.some(mark => mark.type.name === options.type.name)) {
                        isAlreadyLink = true;
                    }
                });
                if (isAlreadyLink) {
                    return;
                }
                const link = linkifyjs.find(textContent).find(item => item.isLink && item.value === textContent);
                if (!selection.empty && options.linkOnPaste) {
                    const pastedLink = (link === null || link === void 0 ? void 0 : link.href) || null;
                    if (pastedLink) {
                        options.editor.commands.setMark(options.type, { href: pastedLink });
                        return true;
                    }
                }
                const firstChildIsText = ((_a = slice.content.firstChild) === null || _a === void 0 ? void 0 : _a.type.name) === 'text';
                const firstChildContainsLinkMark = (_b = slice.content.firstChild) === null || _b === void 0 ? void 0 : _b.marks.some(mark => mark.type.name === options.type.name);
                if ((firstChildIsText && firstChildContainsLinkMark) || !options.linkOnPaste) {
                    return false;
                }
                if (link && selection.empty) {
                    options.editor.commands.insertContent(`<a href="${link.href}">${link.href}</a>`);
                    return true;
                }
                const { tr } = state;
                let deleteOnly = false;
                if (!selection.empty) {
                    deleteOnly = true;
                    tr.delete(selection.from, selection.to);
                }
                let currentPos = selection.from;
                let fragmentLinks = [];
                slice.content.forEach(node => {
                    fragmentLinks = linkifyjs.find(node.textContent);
                    tr.insert(currentPos - 1, node);
                    if (fragmentLinks.length > 0) {
                        deleteOnly = false;
                        fragmentLinks.forEach(fragmentLink => {
                            const linkStart = currentPos + fragmentLink.start;
                            const linkEnd = currentPos + fragmentLink.end;
                            const hasMark = tr.doc.rangeHasMark(linkStart, linkEnd, options.type);
                            if (!hasMark) {
                                tr.addMark(linkStart, linkEnd, options.type.create({ href: fragmentLink.href }));
                            }
                        });
                    }
                    currentPos += node.nodeSize;
                });
                const hasFragmentLinks = fragmentLinks.length > 0;
                if (tr.docChanged && !deleteOnly && hasFragmentLinks) {
                    options.editor.view.dispatch(tr);
                    return true;
                }
                return false;
            },
        },
    });
}

const Link = core.Mark.create({
    name: 'link',
    priority: 1000,
    keepOnSplit: false,
    onCreate() {
        this.options.protocols.forEach(protocol => {
            if (typeof protocol === 'string') {
                linkifyjs.registerCustomProtocol(protocol);
                return;
            }
            linkifyjs.registerCustomProtocol(protocol.scheme, protocol.optionalSlashes);
        });
    },
    onDestroy() {
        linkifyjs.reset();
    },
    inclusive() {
        return this.options.autolink;
    },
    addOptions() {
        return {
            openOnClick: true,
            linkOnPaste: true,
            autolink: true,
            protocols: [],
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: null,
            },
            validate: undefined,
        };
    },
    addAttributes() {
        return {
            href: {
                default: null,
            },
            target: {
                default: this.options.HTMLAttributes.target,
            },
            rel: {
                default: this.options.HTMLAttributes.rel,
            },
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },
    parseHTML() {
        return [{ tag: 'a[href]:not([href *= "javascript:" i])' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['a', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setLink: attributes => ({ chain }) => {
                return chain().setMark(this.name, attributes).setMeta('preventAutolink', true).run();
            },
            toggleLink: attributes => ({ chain }) => {
                return chain()
                    .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
                    .setMeta('preventAutolink', true)
                    .run();
            },
            unsetLink: () => ({ chain }) => {
                return chain()
                    .unsetMark(this.name, { extendEmptyMarkRange: true })
                    .setMeta('preventAutolink', true)
                    .run();
            },
        };
    },
    addProseMirrorPlugins() {
        const plugins = [];
        if (this.options.autolink) {
            plugins.push(autolink({
                type: this.type,
                validate: this.options.validate,
            }));
        }
        if (this.options.openOnClick) {
            plugins.push(clickHandler({
                type: this.type,
            }));
        }
        plugins.push(pasteHandler({
            editor: this.editor,
            type: this.type,
            linkOnPaste: this.options.linkOnPaste,
        }));
        return plugins;
    },
});

exports.Link = Link;
exports["default"] = Link;
//# sourceMappingURL=index.cjs.map
