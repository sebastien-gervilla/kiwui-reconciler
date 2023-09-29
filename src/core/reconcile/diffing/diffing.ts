import { Fiber } from "../../../classes";
import { copyFiber } from "../../../utils/copy-fiber";
import { isFiberComponent, isFiberElement, isFiberText } from "../../../utils/is-type";
import { removeElement } from "../../commit";
import { Action, TAG } from "../reconcile.types";
import { KeysTable, Usage } from "./diffing.types";

export const diffing = (oldChildren: Fiber[], newChildren: Fiber[]) => {
    let actions: Action[] = [];
    let oldTable: KeysTable = [];
    let newTable: KeysTable = [];
    
    let i, j;

    for (i = 0; i < oldChildren.length; i++)
        oldTable.push(getKey(oldChildren[i]));

    for (i = 0; i < newChildren.length; i++)
        newTable.push(getKey(newChildren[i]));

    // Index table: 0 - unused, 1 - used
    let oldIndexTable = new Uint8Array(oldChildren.length);

    // Check for differences
    for (i = j = 0; i !== oldChildren.length || j !== newChildren.length;) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[j];
        
        if (oldIndexTable[i] === Usage.USED) {
            i++; continue;
        }
        
        if (newChildren.length <= j) {
            removeElement(oldChildren[i]);
            i++; continue;
        }
        
        if (oldChildren.length <= i) {
            insertAction(actions, newChild);
            j++; continue;
        }
        
        const oldKey = getKey(oldChild);
        const newKey = getKey(newChild);
        const newIndex = newTable.indexOf(newKey);
        const oldIndex = newTable.indexOf(newKey);
        if (oldKey === newKey && newIndex !== -1 && oldIndex !== -1) {
            newChildren[j] = copyFiber(oldChild, newChild);
            updateAction(actions);
            newTable[newIndex] = null;
            oldTable[oldIndex] = null;
            i++; j++;
            continue;
        }
        
        const oldInNewTable = newTable.indexOf(oldKey);
        if (oldInNewTable === -1) {
            removeElement(oldChildren[i])
            oldIndexTable[i] = Usage.USED;
            i++; continue;
        }
        
        const newInOldTable = oldTable.indexOf(newKey);
        if (newInOldTable === -1) {
            insertAction(actions, newChild, oldChildren[i]);
            j++; continue;
        }

        newChildren[j] = copyFiber(oldChildren[newInOldTable], newChild);
        moveAction(actions, oldChildren[newInOldTable], oldChildren[i]);
        oldIndexTable[newInOldTable] = Usage.USED;

        newTable[oldInNewTable] = null;
        oldTable[newInOldTable] = null;
        j++;
    }
    
    return actions;
}

const getKey = (fiber: Fiber) => {
    if (isFiberComponent(fiber) || isFiberElement(fiber))
        return fiber.props.key + fiber.tag;

    if (isFiberText(fiber))
        return fiber.content;

    throw new Error('Unsupported fiber.');
}

const insertAction = (actions: Action[], element?: Fiber, before?: Fiber) => 
    actions.push({
        op: TAG.INSERT,
        element,
        before
    });

const moveAction = (actions: Action[], element?: Fiber, before?: Fiber) =>
    actions.push({
        op: TAG.MOVE,
        element,
        before
    });

const updateAction = (actions: Action[]) => actions.push({ op: TAG.UPDATE })