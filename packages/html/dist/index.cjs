'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');
var model = require('@tiptap/pm/model');
var zeedDom = require('zeed-dom');

function getHTMLFromFragment(doc, schema, options) {
    if (options === null || options === void 0 ? void 0 : options.document) {
        // The caller is relying on their own document implementation. Use this
        // instead of the default zeed-dom.
        const wrap = options.document.createElement('div');
        model.DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap);
        return wrap.innerHTML;
    }
    // Use zeed-dom for serialization.
    const zeedDocument = model.DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
        document: zeedDom.createHTMLDocument(),
    });
    return zeedDocument.render();
}

function generateHTML(doc, extensions) {
    const schema = core.getSchema(extensions);
    const contentNode = model.Node.fromJSON(schema, doc);
    return getHTMLFromFragment(contentNode, schema);
}

function generateJSON(html, extensions) {
    const schema = core.getSchema(extensions);
    const dom = zeedDom.parseHTML(html);
    return model.DOMParser.fromSchema(schema).parse(dom).toJSON();
}

exports.generateHTML = generateHTML;
exports.generateJSON = generateJSON;
//# sourceMappingURL=index.cjs.map
