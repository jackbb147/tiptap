import { Range, RawCommands } from '../types.js';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        setTextSelection: {
            /**
             * Creates a TextSelection.
             */
            setTextSelection: (position: number | Range) => ReturnType;
        };
    }
}
export declare const setTextSelection: RawCommands['setTextSelection'];
