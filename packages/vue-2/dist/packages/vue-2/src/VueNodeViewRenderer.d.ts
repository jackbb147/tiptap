import { DecorationWithType, NodeViewRenderer, NodeViewRendererOptions } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration } from '@tiptap/pm/view';
import Vue from 'vue';
import { VueConstructor } from 'vue/types/umd';
export declare const nodeViewProps: {
    editor: import("vue-ts-types/dist/types.js").RequiredPropOptions<import("@tiptap/core").Editor>;
    node: import("vue-ts-types/dist/types.js").RequiredPropOptions<ProseMirrorNode>;
    decorations: import("vue-ts-types/dist/types.js").RequiredPropOptions<DecorationWithType[]>;
    selected: import("vue-ts-types/dist/types.js").RequiredPropOptions<boolean>;
    extension: import("vue-ts-types/dist/types.js").RequiredPropOptions<import("@tiptap/core").Node<any, any>>;
    getPos: import("vue-ts-types/dist/types.js").PropOptions<() => number> & {
        required: true;
    } & {
        default?: (() => () => number) | undefined;
    };
    updateAttributes: import("vue-ts-types/dist/types.js").PropOptions<(attributes: Record<string, any>) => void> & {
        required: true;
    } & {
        default?: (() => (attributes: Record<string, any>) => void) | undefined;
    };
    deleteNode: import("vue-ts-types/dist/types.js").PropOptions<() => void> & {
        required: true;
    } & {
        default?: (() => () => void) | undefined;
    };
};
export interface VueNodeViewRendererOptions extends NodeViewRendererOptions {
    update: ((props: {
        oldNode: ProseMirrorNode;
        oldDecorations: Decoration[];
        newNode: ProseMirrorNode;
        newDecorations: Decoration[];
        updateProps: () => void;
    }) => boolean) | null;
}
export declare function VueNodeViewRenderer(component: Vue | VueConstructor, options?: Partial<VueNodeViewRendererOptions>): NodeViewRenderer;
