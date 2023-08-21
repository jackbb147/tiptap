(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tiptap/core'), require('@tiptap/pm/model'), require('zeed-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', '@tiptap/core', '@tiptap/pm/model', 'zeed-dom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@tiptap/html"] = {}, global.core, global.model, global.zeedDom));
})(this, (function (exports, core, model, zeedDom) { 'use strict';

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

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
