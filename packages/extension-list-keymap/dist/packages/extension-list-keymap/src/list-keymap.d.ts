import { Extension } from '@tiptap/core';
export declare type ListKeymapOptions = {
    listTypes: Array<{
        itemName: string;
        wrapperNames: string[];
    }>;
};
export declare const ListKeymap: Extension<ListKeymapOptions, any>;
