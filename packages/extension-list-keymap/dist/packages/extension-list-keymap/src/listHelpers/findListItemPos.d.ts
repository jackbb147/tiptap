import { NodeType } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
export declare const findListItemPos: (typeOrName: string | NodeType, state: EditorState) => {
    $pos: import("prosemirror-model").ResolvedPos;
    depth: number;
} | null;
