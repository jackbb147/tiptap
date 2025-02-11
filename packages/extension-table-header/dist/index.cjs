'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');

const TableHeader = core.Node.create({
    name: 'tableHeader',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: 'block+',
    addAttributes() {
        return {
            colspan: {
                default: 1,
            },
            rowspan: {
                default: 1,
            },
            colwidth: {
                default: null,
                parseHTML: element => {
                    const colwidth = element.getAttribute('colwidth');
                    const value = colwidth
                        ? [parseInt(colwidth, 10)]
                        : null;
                    return value;
                },
            },
        };
    },
    tableRole: 'header_cell',
    isolating: true,
    parseHTML() {
        return [
            { tag: 'th' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['th', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});

exports.TableHeader = TableHeader;
exports["default"] = TableHeader;
//# sourceMappingURL=index.cjs.map
