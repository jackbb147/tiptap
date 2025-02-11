import { RawCommands } from '../types.js';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        setMeta: {
            /**
             * Store a metadata property in the current transaction.
             */
            setMeta: (key: string, value: any) => ReturnType;
        };
    }
}
export declare const setMeta: RawCommands['setMeta'];
