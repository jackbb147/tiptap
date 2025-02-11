import { ParseOptions } from '@tiptap/pm/model';
import { Content, RawCommands } from '../types.js';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        insertContent: {
            /**
             * Insert a node or string of HTML at the current position.
             */
            insertContent: (value: Content, options?: {
                parseOptions?: ParseOptions;
                updateSelection?: boolean;
            }) => ReturnType;
        };
    }
}
export declare const insertContent: RawCommands['insertContent'];
