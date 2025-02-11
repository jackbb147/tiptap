'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');

const TableRow = core.Node.create({
    name: 'tableRow',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: '(tableCell | tableHeader)*',
    tableRole: 'row',
    parseHTML() {
        return [
            { tag: 'tr' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['tr', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});

exports.TableRow = TableRow;
exports["default"] = TableRow;
//# sourceMappingURL=index.cjs.map
