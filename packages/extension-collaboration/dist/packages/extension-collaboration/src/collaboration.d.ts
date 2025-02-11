import { Extension } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        collaboration: {
            /**
             * Undo recent changes
             */
            undo: () => ReturnType;
            /**
             * Reapply reverted changes
             */
            redo: () => ReturnType;
        };
    }
}
export interface CollaborationOptions {
    /**
     * An initialized Y.js document.
     */
    document: any;
    /**
     * Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.
     */
    field: string;
    /**
     * A raw Y.js fragment, can be used instead of `document` and `field`.
     */
    fragment: any;
    /**
     * Fired when the content from Yjs is initially rendered to Tiptap.
     */
    onFirstRender?: () => void;
}
export declare const Collaboration: Extension<CollaborationOptions, any>;
