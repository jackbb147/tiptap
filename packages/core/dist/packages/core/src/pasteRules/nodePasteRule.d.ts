import { NodeType } from '@tiptap/pm/model';
import { PasteRule, PasteRuleFinder } from '../PasteRule.js';
import { ExtendedRegExpMatchArray } from '../types.js';
/**
 * Build an paste rule that adds a node when the
 * matched text is pasted into it.
 */
export declare function nodePasteRule(config: {
    find: PasteRuleFinder;
    type: NodeType;
    getAttributes?: Record<string, any> | ((match: ExtendedRegExpMatchArray) => Record<string, any>) | false | null;
}): PasteRule;
