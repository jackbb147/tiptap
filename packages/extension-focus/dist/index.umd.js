(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tiptap/core'), require('@tiptap/pm/state'), require('@tiptap/pm/view')) :
  typeof define === 'function' && define.amd ? define(['exports', '@tiptap/core', '@tiptap/pm/state', '@tiptap/pm/view'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@tiptap/extension-focus"] = {}, global.core, global.state, global.view));
})(this, (function (exports, core, state, view) { 'use strict';

  const FocusClasses = core.Extension.create({
      name: 'focus',
      addOptions() {
          return {
              className: 'has-focus',
              mode: 'all',
          };
      },
      addProseMirrorPlugins() {
          return [
              new state.Plugin({
                  key: new state.PluginKey('focus'),
                  props: {
                      decorations: ({ doc, selection }) => {
                          const { isEditable, isFocused } = this.editor;
                          const { anchor } = selection;
                          const decorations = [];
                          if (!isEditable || !isFocused) {
                              return view.DecorationSet.create(doc, []);
                          }
                          // Maximum Levels
                          let maxLevels = 0;
                          if (this.options.mode === 'deepest') {
                              doc.descendants((node, pos) => {
                                  if (node.isText) {
                                      return;
                                  }
                                  const isCurrent = anchor >= pos && anchor <= pos + node.nodeSize - 1;
                                  if (!isCurrent) {
                                      return false;
                                  }
                                  maxLevels += 1;
                              });
                          }
                          // Loop through current
                          let currentLevel = 0;
                          doc.descendants((node, pos) => {
                              if (node.isText) {
                                  return false;
                              }
                              const isCurrent = anchor >= pos && anchor <= pos + node.nodeSize - 1;
                              if (!isCurrent) {
                                  return false;
                              }
                              currentLevel += 1;
                              const outOfScope = (this.options.mode === 'deepest' && maxLevels - currentLevel > 0)
                                  || (this.options.mode === 'shallowest' && currentLevel > 1);
                              if (outOfScope) {
                                  return this.options.mode === 'deepest';
                              }
                              decorations.push(view.Decoration.node(pos, pos + node.nodeSize, {
                                  class: this.options.className,
                              }));
                          });
                          return view.DecorationSet.create(doc, decorations);
                      },
                  },
              }),
          ];
      },
  });

  exports.FocusClasses = FocusClasses;
  exports["default"] = FocusClasses;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
