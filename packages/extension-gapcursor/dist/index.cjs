'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');
var gapcursor = require('@tiptap/pm/gapcursor');

const Gapcursor = core.Extension.create({
    name: 'gapCursor',
    addProseMirrorPlugins() {
        return [
            gapcursor.gapCursor(),
        ];
    },
    extendNodeSchema(extension) {
        var _a;
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        return {
            allowGapCursor: (_a = core.callOrReturn(core.getExtensionField(extension, 'allowGapCursor', context))) !== null && _a !== void 0 ? _a : null,
        };
    },
});

exports.Gapcursor = Gapcursor;
exports["default"] = Gapcursor;
//# sourceMappingURL=index.cjs.map
