'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');

const TableCell = core.Node.create({
    name: 'tableCell',
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
    tableRole: 'cell',
    isolating: true,
    parseHTML() {
        return [
            { tag: 'td' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['td', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});

exports.TableCell = TableCell;
exports["default"] = TableCell;
//# sourceMappingURL=index.cjs.map
