import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import ReactDOM, { flushSync } from 'react-dom';
import { Editor as Editor$1, NodeView } from '@tiptap/core';
export * from '@tiptap/core';
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu';

const Portals = ({ renderers }) => {
    return (React.createElement(React.Fragment, null, Object.entries(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(renderer.reactElement, renderer.element, key);
    })));
};
class PureEditorContent extends React.Component {
    constructor(props) {
        super(props);
        this.editorContentRef = React.createRef();
        this.initialized = false;
        this.state = {
            renderers: {},
        };
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { editor } = this.props;
        if (editor && editor.options.element) {
            if (editor.contentComponent) {
                return;
            }
            const element = this.editorContentRef.current;
            element.append(...editor.options.element.childNodes);
            editor.setOptions({
                element,
            });
            editor.contentComponent = this;
            editor.createNodeViews();
            this.initialized = true;
        }
    }
    maybeFlushSync(fn) {
        // Avoid calling flushSync until the editor is initialized.
        // Initialization happens during the componentDidMount or componentDidUpdate
        // lifecycle methods, and React doesn't allow calling flushSync from inside
        // a lifecycle method.
        if (this.initialized) {
            flushSync(fn);
        }
        else {
            fn();
        }
    }
    setRenderer(id, renderer) {
        this.maybeFlushSync(() => {
            this.setState(({ renderers }) => ({
                renderers: {
                    ...renderers,
                    [id]: renderer,
                },
            }));
        });
    }
    removeRenderer(id) {
        this.maybeFlushSync(() => {
            this.setState(({ renderers }) => {
                const nextRenderers = { ...renderers };
                delete nextRenderers[id];
                return { renderers: nextRenderers };
            });
        });
    }
    componentWillUnmount() {
        const { editor } = this.props;
        if (!editor) {
            return;
        }
        this.initialized = false;
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
    }
    render() {
        const { editor, ...rest } = this.props;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { ref: this.editorContentRef, ...rest }),
            React.createElement(Portals, { renderers: this.state.renderers })));
    }
}
// EditorContent should be re-created whenever the Editor instance changes
const EditorContentWithKey = (props) => {
    const key = React.useMemo(() => {
        return Math.floor(Math.random() * 0xFFFFFFFF).toString();
    }, [props.editor]);
    // Can't use JSX here because it conflicts with the type definition of Vue's JSX, so use createElement
    return React.createElement(PureEditorContent, { key, ...props });
};
const EditorContent = React.memo(EditorContentWithKey);

class Editor extends Editor$1 {
    constructor() {
        super(...arguments);
        this.contentComponent = null;
    }
}

function useForceUpdate() {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}
const useEditor = (options = {}, deps = []) => {
    const [editor, setEditor] = useState(null);
    const forceUpdate = useForceUpdate();
    const { onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, } = options;
    const onBeforeCreateRef = useRef(onBeforeCreate);
    const onBlurRef = useRef(onBlur);
    const onCreateRef = useRef(onCreate);
    const onDestroyRef = useRef(onDestroy);
    const onFocusRef = useRef(onFocus);
    const onSelectionUpdateRef = useRef(onSelectionUpdate);
    const onTransactionRef = useRef(onTransaction);
    const onUpdateRef = useRef(onUpdate);
    // This effect will handle updating the editor instance
    // when the event handlers change.
    useEffect(() => {
        if (!editor) {
            return;
        }
        if (onBeforeCreate) {
            editor.off('beforeCreate', onBeforeCreateRef.current);
            editor.on('beforeCreate', onBeforeCreate);
            onBeforeCreateRef.current = onBeforeCreate;
        }
        if (onBlur) {
            editor.off('blur', onBlurRef.current);
            editor.on('blur', onBlur);
            onBlurRef.current = onBlur;
        }
        if (onCreate) {
            editor.off('create', onCreateRef.current);
            editor.on('create', onCreate);
            onCreateRef.current = onCreate;
        }
        if (onDestroy) {
            editor.off('destroy', onDestroyRef.current);
            editor.on('destroy', onDestroy);
            onDestroyRef.current = onDestroy;
        }
        if (onFocus) {
            editor.off('focus', onFocusRef.current);
            editor.on('focus', onFocus);
            onFocusRef.current = onFocus;
        }
        if (onSelectionUpdate) {
            editor.off('selectionUpdate', onSelectionUpdateRef.current);
            editor.on('selectionUpdate', onSelectionUpdate);
            onSelectionUpdateRef.current = onSelectionUpdate;
        }
        if (onTransaction) {
            editor.off('transaction', onTransactionRef.current);
            editor.on('transaction', onTransaction);
            onTransactionRef.current = onTransaction;
        }
        if (onUpdate) {
            editor.off('update', onUpdateRef.current);
            editor.on('update', onUpdate);
            onUpdateRef.current = onUpdate;
        }
    }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, editor]);
    useEffect(() => {
        let isMounted = true;
        const instance = new Editor(options);
        setEditor(instance);
        instance.on('transaction', () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (isMounted) {
                        forceUpdate();
                    }
                });
            });
        });
        return () => {
            isMounted = false;
        };
    }, deps);
    useEffect(() => {
        return () => {
            editor === null || editor === void 0 ? void 0 : editor.destroy();
        };
    }, [editor]);
    return editor;
};

const EditorContext = createContext({
    editor: null,
});
const EditorConsumer = EditorContext.Consumer;
const useCurrentEditor = () => useContext(EditorContext);
const EditorProvider = ({ children, slotAfter, slotBefore, ...editorOptions }) => {
    const editor = useEditor(editorOptions);
    if (!editor) {
        return null;
    }
    return (React.createElement(EditorContext.Provider, { value: { editor } },
        slotBefore,
        React.createElement(EditorConsumer, null, ({ editor: currentEditor }) => (React.createElement(EditorContent, { editor: currentEditor }))),
        children,
        slotAfter));
};

const BubbleMenu = (props) => {
    const [element, setElement] = useState(null);
    const { editor: currentEditor } = useCurrentEditor();
    useEffect(() => {
        var _a;
        if (!element) {
            return;
        }
        if (((_a = props.editor) === null || _a === void 0 ? void 0 : _a.isDestroyed) || (currentEditor === null || currentEditor === void 0 ? void 0 : currentEditor.isDestroyed)) {
            return;
        }
        const { pluginKey = 'bubbleMenu', editor, tippyOptions = {}, updateDelay, shouldShow = null, } = props;
        const menuEditor = editor || currentEditor;
        if (!menuEditor) {
            console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.');
            return;
        }
        const plugin = BubbleMenuPlugin({
            updateDelay,
            editor: menuEditor,
            element,
            pluginKey,
            shouldShow,
            tippyOptions,
        });
        menuEditor.registerPlugin(plugin);
        return () => menuEditor.unregisterPlugin(pluginKey);
    }, [props.editor, currentEditor, element]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

const FloatingMenu = (props) => {
    const [element, setElement] = useState(null);
    const { editor: currentEditor } = useCurrentEditor();
    useEffect(() => {
        var _a;
        if (!element) {
            return;
        }
        if (((_a = props.editor) === null || _a === void 0 ? void 0 : _a.isDestroyed) || (currentEditor === null || currentEditor === void 0 ? void 0 : currentEditor.isDestroyed)) {
            return;
        }
        const { pluginKey = 'floatingMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
        const menuEditor = editor || currentEditor;
        if (!menuEditor) {
            console.warn('FloatingMenu component is not rendered inside of an editor component or does not have editor prop.');
            return;
        }
        const plugin = FloatingMenuPlugin({
            pluginKey,
            editor: menuEditor,
            element,
            tippyOptions,
            shouldShow,
        });
        menuEditor.registerPlugin(plugin);
        return () => menuEditor.unregisterPlugin(pluginKey);
    }, [
        props.editor,
        currentEditor,
        element,
    ]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

const ReactNodeViewContext = createContext({
    onDragStart: undefined,
});
const useReactNodeView = () => useContext(ReactNodeViewContext);

const NodeViewContent = props => {
    const Tag = props.as || 'div';
    const { nodeViewContentRef } = useReactNodeView();
    return (React.createElement(Tag, { ...props, ref: nodeViewContentRef, "data-node-view-content": "", style: {
            whiteSpace: 'pre-wrap',
            ...props.style,
        } }));
};

const NodeViewWrapper = React.forwardRef((props, ref) => {
    const { onDragStart } = useReactNodeView();
    const Tag = props.as || 'div';
    return (React.createElement(Tag, { ...props, ref: ref, "data-node-view-wrapper": "", onDragStart: onDragStart, style: {
            whiteSpace: 'normal',
            ...props.style,
        } }));
});

function isClassComponent(Component) {
    return !!(typeof Component === 'function'
        && Component.prototype
        && Component.prototype.isReactComponent);
}
function isForwardRefComponent(Component) {
    var _a;
    return !!(typeof Component === 'object'
        && ((_a = Component.$$typeof) === null || _a === void 0 ? void 0 : _a.toString()) === 'Symbol(react.forward_ref)');
}
class ReactRenderer {
    constructor(component, { editor, props = {}, as = 'div', className = '', attrs, }) {
        this.ref = null;
        this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString();
        this.component = component;
        this.editor = editor;
        this.props = props;
        this.element = document.createElement(as);
        this.element.classList.add('react-renderer');
        if (className) {
            this.element.classList.add(...className.split(' '));
        }
        if (attrs) {
            Object.keys(attrs).forEach(key => {
                this.element.setAttribute(key, attrs[key]);
            });
        }
        this.render();
    }
    render() {
        var _a, _b;
        const Component = this.component;
        const props = this.props;
        if (isClassComponent(Component) || isForwardRefComponent(Component)) {
            props.ref = (ref) => {
                this.ref = ref;
            };
        }
        this.reactElement = React.createElement(Component, { ...props });
        (_b = (_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) === null || _b === void 0 ? void 0 : _b.setRenderer(this.id, this);
    }
    updateProps(props = {}) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.render();
    }
    destroy() {
        var _a, _b;
        (_b = (_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) === null || _b === void 0 ? void 0 : _b.removeRenderer(this.id);
    }
}

class ReactNodeView extends NodeView {
    mount() {
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
        if (!this.component.displayName) {
            const capitalizeFirstChar = (string) => {
                return string.charAt(0).toUpperCase() + string.substring(1);
            };
            this.component.displayName = capitalizeFirstChar(this.extension.name);
        }
        const ReactNodeViewProvider = componentProps => {
            const Component = this.component;
            const onDragStart = this.onDragStart.bind(this);
            const nodeViewContentRef = element => {
                if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
                    element.appendChild(this.contentDOMElement);
                }
            };
            return (React.createElement(React.Fragment, null,
                React.createElement(ReactNodeViewContext.Provider, { value: { onDragStart, nodeViewContentRef } },
                    React.createElement(Component, { ...componentProps }))));
        };
        ReactNodeViewProvider.displayName = 'ReactNodeView';
        if (this.node.isLeaf) {
            this.contentDOMElement = null;
        }
        else if (this.options.contentDOMElementTag) {
            this.contentDOMElement = document.createElement(this.options.contentDOMElementTag);
        }
        else {
            this.contentDOMElement = document.createElement(this.node.isInline ? 'span' : 'div');
        }
        if (this.contentDOMElement) {
            // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
            // With this fix it seems to work fine
            // See: https://github.com/ueberdosis/tiptap/issues/1197
            this.contentDOMElement.style.whiteSpace = 'inherit';
        }
        let as = this.node.isInline ? 'span' : 'div';
        if (this.options.as) {
            as = this.options.as;
        }
        const { className = '' } = this.options;
        this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this);
        this.editor.on('selectionUpdate', this.handleSelectionUpdate);
        this.renderer = new ReactRenderer(ReactNodeViewProvider, {
            editor: this.editor,
            props,
            as,
            className: `node-${this.node.type.name} ${className}`.trim(),
            attrs: this.options.attrs,
        });
    }
    get dom() {
        var _a;
        if (this.renderer.element.firstElementChild
            && !((_a = this.renderer.element.firstElementChild) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-node-view-wrapper'))) {
            // eslint-disable-next-line no-debugger
            const element = this.renderer.element;
            // const isUsingACEEditor = element.children.length === 3 && element.children[0].tagName === 'STYLE' && element.children[1].tagName === 'STYLE'
            const isUsingACEEditor = element.children.length === 3 && element.children[0].id.includes('ace');
            // debugger;
            if (isUsingACEEditor) {
                console.debug('[JACK] LETTING ACE GO! ');
                try {
                    while (element.children.length > 1) {
                        const child = element.children[0];
                        // debugger;
                        console.debug('[JACK] removing child: ', child);
                        if (child.id.includes('ace')) {
                            // debugger
                            // TODO check if document head already has this child
                            let found = false;
                            for (let i = 0; i < document.head.children.length; i += 1) {
                                const temp = document.head.children[i];
                                if (temp.id === child.id) {
                                    found = true;
                                    break;
                                }
                            }
                            // debugger;
                            if (!found) {
                                // debugger;
                                document.head.appendChild(child);
                            }
                            else {
                                element.removeChild(child);
                            }
                        }
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            else {
                console.debug('[JACK] this is the bug!!! ');
                throw Error('Please use the NodeViewWrapper component for your node view.');
            }
        }
        return this.renderer.element;
    }
    get contentDOM() {
        if (this.node.isLeaf) {
            return null;
        }
        return this.contentDOMElement;
    }
    handleSelectionUpdate() {
        const { from, to } = this.editor.state.selection;
        if (from <= this.getPos() && to >= this.getPos() + this.node.nodeSize) {
            this.selectNode();
        }
        else {
            this.deselectNode();
        }
    }
    update(node, decorations) {
        const updateProps = (props) => {
            this.renderer.updateProps(props);
        };
        if (node.type !== this.node.type) {
            return false;
        }
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
    destroy() {
        this.renderer.destroy();
        this.editor.off('selectionUpdate', this.handleSelectionUpdate);
        this.contentDOMElement = null;
    }
}
function ReactNodeViewRenderer(component, options) {
    return (props) => {
        // try to get the parent component
        // this is important for vue devtools to show the component hierarchy correctly
        // maybe it’s `undefined` because <editor-content> isn’t rendered yet
        if (!props.editor.contentComponent) {
            return {};
        }
        return new ReactNodeView(component, props, options);
    };
}

export { BubbleMenu, Editor, EditorConsumer, EditorContent, EditorContext, EditorProvider, FloatingMenu, NodeViewContent, NodeViewWrapper, PureEditorContent, ReactNodeViewRenderer, ReactRenderer, useCurrentEditor, useEditor };
//# sourceMappingURL=index.js.map
