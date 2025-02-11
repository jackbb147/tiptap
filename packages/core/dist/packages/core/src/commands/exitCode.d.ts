import { RawCommands } from '../types.js';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        exitCode: {
            /**
             * Exit from a code block.
             */
            exitCode: () => ReturnType;
        };
    }
}
export declare const exitCode: RawCommands['exitCode'];
