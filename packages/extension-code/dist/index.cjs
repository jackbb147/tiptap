'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');

const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/;
const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/g;
const Code = core.Mark.create({
    name: 'code',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    excludes: '_',
    code: true,
    exitable: true,
    parseHTML() {
        return [
            { tag: 'code' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['code', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setCode: () => ({ commands }) => {
                return commands.setMark(this.name);
            },
            toggleCode: () => ({ commands }) => {
                return commands.toggleMark(this.name);
            },
            unsetCode: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-e': () => this.editor.commands.toggleCode(),
        };
    },
    addInputRules() {
        return [
            core.markInputRule({
                find: inputRegex,
                type: this.type,
            }),
        ];
    },
    addPasteRules() {
        return [
            core.markPasteRule({
                find: pasteRegex,
                type: this.type,
            }),
        ];
    },
});

exports.Code = Code;
exports["default"] = Code;
exports.inputRegex = inputRegex;
exports.pasteRegex = pasteRegex;
//# sourceMappingURL=index.cjs.map
