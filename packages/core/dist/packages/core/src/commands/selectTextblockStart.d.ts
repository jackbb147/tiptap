import { RawCommands } from '../types.js';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        selectTextblockStart: {
            /**
             * Moves the cursor to the start of current text block.
             */
            selectTextblockStart: () => ReturnType;
        };
    }
}
export declare const selectTextblockStart: RawCommands['selectTextblockStart'];
