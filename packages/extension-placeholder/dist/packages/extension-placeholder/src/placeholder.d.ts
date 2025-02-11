import { Editor, Extension } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
export interface PlaceholderOptions {
    /**
     * **The class name for the empty editor**
     * @default 'is-editor-empty'
     */
    emptyEditorClass: string;
    /**
     * **The class name for empty nodes**
     * @default 'is-empty'
     */
    emptyNodeClass: string;
    /**
     * **The placeholder content**
     *
     * You can use a function to return a dynamic placeholder or a string.
     * @default 'Write something …'
     */
    placeholder: ((PlaceholderProps: {
        editor: Editor;
        node: ProsemirrorNode;
        pos: number;
        hasAnchor: boolean;
    }) => string) | string;
    /**
     * **Used for empty check on the document.**
     *
     * If true, any node that is not a leaf or atom will be considered for empty check.
     * If false, only default nodes (paragraphs) will be considered for empty check.
     * @default false
     */
    considerAnyAsEmpty: boolean;
    /**
     * **Checks if the placeholder should be only shown when the editor is editable.**
     *
     * If true, the placeholder will only be shown when the editor is editable.
     * If false, the placeholder will always be shown.
     * @default true
     */
    showOnlyWhenEditable: boolean;
    /**
     * **Checks if the placeholder should be only shown when the current node is empty.**
     *
     * If true, the placeholder will only be shown when the current node is empty.
     * If false, the placeholder will be shown when any node is empty.
     * @default true
     */
    showOnlyCurrent: boolean;
    /**
     * **Controls if the placeholder should be shown for all descendents.**
     *
     * If true, the placeholder will be shown for all descendents.
     * If false, the placeholder will only be shown for the current node.
     * @default false
     */
    includeChildren: boolean;
}
export declare const Placeholder: Extension<PlaceholderOptions, any>;
