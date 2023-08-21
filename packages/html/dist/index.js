import { getSchema } from '@tiptap/core';
import { DOMSerializer, Node, DOMParser } from '@tiptap/pm/model';
import { createHTMLDocument, parseHTML } from 'zeed-dom';

function getHTMLFromFragment(doc, schema, options) {
    if (options === null || options === void 0 ? void 0 : options.document) {
        // The caller is relying on their own document implementation. Use this
        // instead of the default zeed-dom.
        const wrap = options.document.createElement('div');
        DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap);
        return wrap.innerHTML;
    }
    // Use zeed-dom for serialization.
    const zeedDocument = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
        document: createHTMLDocument(),
    });
    return zeedDocument.render();
}

function generateHTML(doc, extensions) {
    const schema = getSchema(extensions);
    const contentNode = Node.fromJSON(schema, doc);
    return getHTMLFromFragment(contentNode, schema);
}

function generateJSON(html, extensions) {
    const schema = getSchema(extensions);
    const dom = parseHTML(html);
    return DOMParser.fromSchema(schema).parse(dom).toJSON();
}

export { generateHTML, generateJSON };
//# sourceMappingURL=index.js.map
