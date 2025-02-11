import { Extension } from '@tiptap/core';
import { FloatingMenuPluginProps } from './floating-menu-plugin.js';
export declare type FloatingMenuOptions = Omit<FloatingMenuPluginProps, 'editor' | 'element'> & {
    element: HTMLElement | null;
};
export declare const FloatingMenu: Extension<FloatingMenuOptions, any>;
