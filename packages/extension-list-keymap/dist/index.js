import { getNodeType, getNodeAtPosition, isNodeActive, isAtStartOfNode, isAtEndOfNode, Extension } from '@tiptap/core';

const findListItemPos = (typeOrName, state) => {
    const { $from } = state.selection;
    const nodeType = getNodeType(typeOrName, state.schema);
    let currentNode = null;
    let currentDepth = $from.depth;
    let currentPos = $from.pos;
    let targetDepth = null;
    while (currentDepth > 0 && targetDepth === null) {
        currentNode = $from.node(currentDepth);
        if (currentNode.type === nodeType) {
            targetDepth = currentDepth;
        }
        else {
            currentDepth -= 1;
            currentPos -= 1;
        }
    }
    if (targetDepth === null) {
        return null;
    }
    return { $pos: state.doc.resolve(currentPos), depth: targetDepth };
};

const getNextListDepth = (typeOrName, state) => {
    const listItemPos = findListItemPos(typeOrName, state);
    if (!listItemPos) {
        return false;
    }
    const [, depth] = getNodeAtPosition(state, typeOrName, listItemPos.$pos.pos + 4);
    return depth;
};

const hasListBefore = (editorState, name, parentListTypes) => {
    const { $anchor } = editorState.selection;
    const previousNodePos = Math.max(0, $anchor.pos - 2);
    const previousNode = editorState.doc.resolve(previousNodePos).node();
    if (!previousNode || !parentListTypes.includes(previousNode.type.name)) {
        return false;
    }
    return true;
};

const hasListItemBefore = (typeOrName, state) => {
    var _a;
    const { $anchor } = state.selection;
    const $targetPos = state.doc.resolve($anchor.pos - 2);
    if ($targetPos.index() === 0) {
        return false;
    }
    if (((_a = $targetPos.nodeBefore) === null || _a === void 0 ? void 0 : _a.type.name) !== typeOrName) {
        return false;
    }
    return true;
};

const listItemHasSubList = (typeOrName, state, node) => {
    if (!node) {
        return false;
    }
    const nodeType = getNodeType(typeOrName, state.schema);
    let hasSubList = false;
    node.descendants(child => {
        if (child.type === nodeType) {
            hasSubList = true;
        }
    });
    return hasSubList;
};

const handleBackspace = (editor, name, parentListTypes) => {
    // this is required to still handle the undo handling
    if (editor.commands.undoInputRule()) {
        return true;
    }
    // if the current item is NOT inside a list item &
    // the previous item is a list (orderedList or bulletList)
    // move the cursor into the list and delete the current item
    if (!isNodeActive(editor.state, name) && hasListBefore(editor.state, name, parentListTypes)) {
        const { $anchor } = editor.state.selection;
        const $listPos = editor.state.doc.resolve($anchor.before() - 1);
        const listDescendants = [];
        $listPos.node().descendants((node, pos) => {
            if (node.type.name === name) {
                listDescendants.push({ node, pos });
            }
        });
        const lastItem = listDescendants.at(-1);
        if (!lastItem) {
            return false;
        }
        const $lastItemPos = editor.state.doc.resolve($listPos.start() + lastItem.pos + 1);
        return editor.chain().cut({ from: $anchor.start() - 1, to: $anchor.end() + 1 }, $lastItemPos.end()).joinForward().run();
    }
    // if the cursor is not inside the current node type
    // do nothing and proceed
    if (!isNodeActive(editor.state, name)) {
        return false;
    }
    // if the cursor is not at the start of a node
    // do nothing and proceed
    if (!isAtStartOfNode(editor.state)) {
        return false;
    }
    const listItemPos = findListItemPos(name, editor.state);
    if (!listItemPos) {
        return false;
    }
    const $prev = editor.state.doc.resolve(listItemPos.$pos.pos - 2);
    const prevNode = $prev.node(listItemPos.depth);
    const previousListItemHasSubList = listItemHasSubList(name, editor.state, prevNode);
    // if the previous item is a list item and doesn't have a sublist, join the list items
    if (hasListItemBefore(name, editor.state) && !previousListItemHasSubList) {
        return editor.commands.joinItemBackward();
    }
    // otherwise in the end, a backspace should
    // always just lift the list item if
    // joining / merging is not possible
    return editor.chain().liftListItem(name).run();
};

const nextListIsDeeper = (typeOrName, state) => {
    const listDepth = getNextListDepth(typeOrName, state);
    const listItemPos = findListItemPos(typeOrName, state);
    if (!listItemPos || !listDepth) {
        return false;
    }
    if (listDepth > listItemPos.depth) {
        return true;
    }
    return false;
};

const nextListIsHigher = (typeOrName, state) => {
    const listDepth = getNextListDepth(typeOrName, state);
    const listItemPos = findListItemPos(typeOrName, state);
    if (!listItemPos || !listDepth) {
        return false;
    }
    if (listDepth < listItemPos.depth) {
        return true;
    }
    return false;
};

const handleDelete = (editor, name) => {
    // if the cursor is not inside the current node type
    // do nothing and proceed
    if (!isNodeActive(editor.state, name)) {
        return false;
    }
    // if the cursor is not at the end of a node
    // do nothing and proceed
    if (!isAtEndOfNode(editor.state, name)) {
        return false;
    }
    // check if the next node is a list with a deeper depth
    if (nextListIsDeeper(name, editor.state)) {
        return editor
            .chain()
            .focus(editor.state.selection.from + 4)
            .lift(name)
            .joinBackward()
            .run();
    }
    if (nextListIsHigher(name, editor.state)) {
        return editor.chain()
            .joinForward()
            .joinBackward()
            .run();
    }
    return editor.commands.joinItemForward();
};

const hasListItemAfter = (typeOrName, state) => {
    var _a;
    const { $anchor } = state.selection;
    const $targetPos = state.doc.resolve($anchor.pos - $anchor.parentOffset - 2);
    if ($targetPos.index() === $targetPos.parent.childCount - 1) {
        return false;
    }
    if (((_a = $targetPos.nodeAfter) === null || _a === void 0 ? void 0 : _a.type.name) !== typeOrName) {
        return false;
    }
    return true;
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  findListItemPos: findListItemPos,
  getNextListDepth: getNextListDepth,
  handleBackspace: handleBackspace,
  handleDelete: handleDelete,
  hasListBefore: hasListBefore,
  hasListItemAfter: hasListItemAfter,
  hasListItemBefore: hasListItemBefore,
  listItemHasSubList: listItemHasSubList,
  nextListIsDeeper: nextListIsDeeper,
  nextListIsHigher: nextListIsHigher
});

const ListKeymap = Extension.create({
    name: 'listKeymap',
    addOptions() {
        return {
            listTypes: [
                {
                    itemName: 'listItem',
                    wrapperNames: ['bulletList', 'orderedList'],
                },
                {
                    itemName: 'taskItem',
                    wrapperNames: ['taskList'],
                },
            ],
        };
    },
    addKeyboardShortcuts() {
        return {
            Delete: ({ editor }) => {
                let handled = false;
                this.options.listTypes.forEach(({ itemName }) => {
                    if (editor.state.schema.nodes[itemName] === undefined) {
                        return;
                    }
                    if (handleDelete(editor, itemName)) {
                        handled = true;
                    }
                });
                return handled;
            },
            'Mod-Delete': ({ editor }) => {
                let handled = false;
                this.options.listTypes.forEach(({ itemName }) => {
                    if (editor.state.schema.nodes[itemName] === undefined) {
                        return;
                    }
                    if (handleDelete(editor, itemName)) {
                        handled = true;
                    }
                });
                return handled;
            },
            Backspace: ({ editor }) => {
                let handled = false;
                this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
                    if (editor.state.schema.nodes[itemName] === undefined) {
                        return;
                    }
                    if (handleBackspace(editor, itemName, wrapperNames)) {
                        handled = true;
                    }
                });
                return handled;
            },
            'Mod-Backspace': ({ editor }) => {
                let handled = false;
                this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
                    if (editor.state.schema.nodes[itemName] === undefined) {
                        return;
                    }
                    if (handleBackspace(editor, itemName, wrapperNames)) {
                        handled = true;
                    }
                });
                return handled;
            },
        };
    },
});

export { ListKeymap, ListKeymap as default, index as listHelpers };
//# sourceMappingURL=index.js.map
