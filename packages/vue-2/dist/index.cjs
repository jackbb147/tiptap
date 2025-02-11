'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var extensionBubbleMenu = require('@tiptap/extension-bubble-menu');
var core = require('@tiptap/core');
var extensionFloatingMenu = require('@tiptap/extension-floating-menu');
var Vue = require('vue');
var vueTsTypes = require('vue-ts-types');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Vue__default = /*#__PURE__*/_interopDefaultLegacy(Vue);

const BubbleMenu = {
    name: 'BubbleMenu',
    props: {
        pluginKey: {
            type: [String, Object],
            default: 'bubbleMenu',
        },
        editor: {
            type: Object,
            required: true,
        },
        updateDelay: {
            type: Number,
        },
        tippyOptions: {
            type: Object,
            default: () => ({}),
        },
        shouldShow: {
            type: Function,
            default: null,
        },
    },
    watch: {
        editor: {
            immediate: true,
            handler(editor) {
                if (!editor) {
                    return;
                }
                this.$nextTick(() => {
                    editor.registerPlugin(extensionBubbleMenu.BubbleMenuPlugin({
                        updateDelay: this.updateDelay,
                        editor,
                        element: this.$el,
                        pluginKey: this.pluginKey,
                        shouldShow: this.shouldShow,
                        tippyOptions: this.tippyOptions,
                    }));
                });
            },
        },
    },
    render(createElement) {
        return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default);
    },
    beforeDestroy() {
        this.editor.unregisterPlugin(this.pluginKey);
    },
};

class Editor extends core.Editor {
    constructor() {
        super(...arguments);
        this.contentComponent = null;
    }
}

const EditorContent = {
    name: 'EditorContent',
    props: {
        editor: {
            default: null,
            type: Object,
        },
    },
    watch: {
        editor: {
            immediate: true,
            handler(editor) {
                if (editor && editor.options.element) {
                    this.$nextTick(() => {
                        const element = this.$el;
                        if (!element || !editor.options.element.firstChild) {
                            return;
                        }
                        element.append(...editor.options.element.childNodes);
                        editor.contentComponent = this;
                        editor.setOptions({
                            element,
                        });
                        editor.createNodeViews();
                    });
                }
            },
        },
    },
    render(createElement) {
        return createElement('div');
    },
    beforeDestroy() {
        const { editor } = this;
        if (!editor) {
            return;
        }
        if (!editor.isDestroyed) {
            editor.view.setProps({
                nodeViews: {},
            });
        }
        editor.contentComponent = null;
        if (!editor.options.element.firstChild) {
            return;
        }
        const newElement = document.createElement('div');
        newElement.append(...editor.options.element.childNodes);
        editor.setOptions({
            element: newElement,
        });
    },
};

const FloatingMenu = {
    name: 'FloatingMenu',
    props: {
        pluginKey: {
            type: [String, Object],
            default: 'floatingMenu',
        },
        editor: {
            type: Object,
            required: true,
        },
        tippyOptions: {
            type: Object,
            default: () => ({}),
        },
        shouldShow: {
            type: Function,
            default: null,
        },
    },
    watch: {
        editor: {
            immediate: true,
            handler(editor) {
                if (!editor) {
                    return;
                }
                this.$nextTick(() => {
                    editor.registerPlugin(extensionFloatingMenu.FloatingMenuPlugin({
                        pluginKey: this.pluginKey,
                        editor,
                        element: this.$el,
                        tippyOptions: this.tippyOptions,
                        shouldShow: this.shouldShow,
                    }));
                });
            },
        },
    },
    render(createElement) {
        return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default);
    },
    beforeDestroy() {
        this.editor.unregisterPlugin(this.pluginKey);
    },
};

const NodeViewContent = {
    props: {
        as: {
            type: String,
            default: 'div',
        },
    },
    render(createElement) {
        return createElement(this.as, {
            style: {
                whiteSpace: 'pre-wrap',
            },
            attrs: {
                'data-node-view-content': '',
            },
        });
    },
};

const NodeViewWrapper = {
    props: {
        as: {
            type: String,
            default: 'div',
        },
    },
    inject: ['onDragStart', 'decorationClasses'],
    render(createElement) {
        return createElement(this.as, {
            class: this.decorationClasses.value,
            style: {
                whiteSpace: 'normal',
            },
            attrs: {
                'data-node-view-wrapper': '',
            },
            on: {
                dragstart: this.onDragStart,
            },
        }, this.$slots.default);
    },
};

class VueRenderer {
    constructor(component, props) {
        const Component = (typeof component === 'function') ? component : Vue__default["default"].extend(component);
        this.ref = new Component(props).$mount();
    }
    get element() {
        return this.ref.$el;
    }
    updateProps(props = {}) {
        var _a, _b, _c;
        if (!this.ref.$props) {
            return;
        }
        // prevents `Avoid mutating a prop directly` error message
        // Fix: `VueNodeViewRenderer` change vue Constructor `config.silent` not working
        const currentVueConstructor = (_c = (_b = (_a = this.ref.$props.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) === null || _b === void 0 ? void 0 : _b.$options._base) !== null && _c !== void 0 ? _c : Vue__default["default"]; // eslint-disable-line
        const originalSilent = currentVueConstructor.config.silent;
        currentVueConstructor.config.silent = true;
        Object
            .entries(props)
            .forEach(([key, value]) => {
            this.ref.$props[key] = value;
        });
        currentVueConstructor.config.silent = originalSilent;
    }
    destroy() {
        this.ref.$destroy();
    }
}

const nodeViewProps = {
    editor: vueTsTypes.objectProp().required,
    node: vueTsTypes.objectProp().required,
    decorations: vueTsTypes.objectProp().required,
    selected: vueTsTypes.booleanProp().required,
    extension: vueTsTypes.objectProp().required,
    getPos: vueTsTypes.functionProp().required,
    updateAttributes: vueTsTypes.functionProp().required,
    deleteNode: vueTsTypes.functionProp().required,
};
class VueNodeView extends core.NodeView {
    mount() {
        var _a, _b;
        const props = {
            editor: this.editor,
            node: this.node,
            decorations: this.decorations,
            selected: false,
            extension: this.extension,
            getPos: () => this.getPos(),
            updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
            deleteNode: () => this.deleteNode(),
        };
        const onDragStart = this.onDragStart.bind(this);
        this.decorationClasses = Vue__default["default"].observable({
            value: this.getDecorationClasses(),
        });
        // @ts-ignore
        const vue = (_b = (_a = this.editor.contentComponent) === null || _a === void 0 ? void 0 : _a.$options._base) !== null && _b !== void 0 ? _b : Vue__default["default"]; // eslint-disable-line
        const Component = vue.extend(this.component).extend({
            props: Object.keys(props),
            provide: () => {
                return {
                    onDragStart,
                    decorationClasses: this.decorationClasses,
                };
            },
        });
        this.renderer = new VueRenderer(Component, {
            parent: this.editor.contentComponent,
            propsData: props,
        });
    }
    get dom() {
        if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
            throw Error('Please use the NodeViewWrapper component for your node view.');
        }
        return this.renderer.element;
    }
    get contentDOM() {
        if (this.node.isLeaf) {
            return null;
        }
        const contentElement = this.dom.querySelector('[data-node-view-content]');
        return (contentElement || this.dom);
    }
    update(node, decorations) {
        const updateProps = (props) => {
            this.decorationClasses.value = this.getDecorationClasses();
            this.renderer.updateProps(props);
        };
        if (typeof this.options.update === 'function') {
            const oldNode = this.node;
            const oldDecorations = this.decorations;
            this.node = node;
            this.decorations = decorations;
            return this.options.update({
                oldNode,
                oldDecorations,
                newNode: node,
                newDecorations: decorations,
                updateProps: () => updateProps({ node, decorations }),
            });
        }
        if (node.type !== this.node.type) {
            return false;
        }
        if (node === this.node && this.decorations === decorations) {
            return true;
        }
        this.node = node;
        this.decorations = decorations;
        updateProps({ node, decorations });
        return true;
    }
    selectNode() {
        this.renderer.updateProps({
            selected: true,
        });
    }
    deselectNode() {
        this.renderer.updateProps({
            selected: false,
        });
    }
    getDecorationClasses() {
        return (this.decorations
            // @ts-ignore
            .map(item => item.type.attrs.class)
            .flat()
            .join(' '));
    }
    destroy() {
        this.renderer.destroy();
    }
}
function VueNodeViewRenderer(component, options) {
    return (props) => {
        // try to get the parent component
        // this is important for vue devtools to show the component hierarchy correctly
        // maybe it’s `undefined` because <editor-content> isn’t rendered yet
        if (!props.editor.contentComponent) {
            return {};
        }
        return new VueNodeView(component, props, options);
    };
}

exports.BubbleMenu = BubbleMenu;
exports.Editor = Editor;
exports.EditorContent = EditorContent;
exports.FloatingMenu = FloatingMenu;
exports.NodeViewContent = NodeViewContent;
exports.NodeViewWrapper = NodeViewWrapper;
exports.VueNodeViewRenderer = VueNodeViewRenderer;
exports.VueRenderer = VueRenderer;
exports.nodeViewProps = nodeViewProps;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return core[k]; }
  });
});
//# sourceMappingURL=index.cjs.map
