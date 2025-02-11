import { Extension } from '@tiptap/core';
import { BubbleMenuPluginProps } from './bubble-menu-plugin.js';
export declare type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element'> & {
    element: HTMLElement | null;
};
export declare const BubbleMenu: Extension<BubbleMenuOptions, any>;
