import { Fiber } from "../../../classes";
import { copyFiber } from "../../../utils/copy-fiber";
import { isFiberComponent, isFiberElement, isFiberText } from "../../../utils/is-type";
import { removeElement } from "../../commit";
import { Action, TAG } from "../reconcile.types";
import { KeysTable, Usage } from "./diffing.types";

export const diffing = (oldChildren: Fiber[], newChildren: Fiber[]) => {
    let actions: Action[] = [];
    let oldTable: KeysTable = {};
    let newTable: KeysTable = {};
    
    let i, j;

    // TODO: Huge problem, if elements have no keys of same type, it won't push it
    for (i = 0; i < oldChildren.length; i++)
        oldTable[getKey(oldChildren[i])] = i;

    for (i = 0; i < newChildren.length; i++)
        newTable[getKey(newChildren[i])] = i;

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
            removeElement(oldChildren[i])
            i++; continue;
        }
        
        if (oldChildren.length <= i) {
            insertAction(actions, newChild, oldChildren[i]);
            j++; continue;
        }
        
        if (getKey(oldChild) === getKey(newChild)) {
            newChildren[j] = copyFiber(oldChild, newChild);
            updateAction(actions);
            i++; j++;
            continue;
        }
        
        const oldInNewTable = newTable[getKey(oldChild)];
        const newInOldTable = oldTable[getKey(newChild)];

        if (oldInNewTable === undefined) {
            removeElement(oldChildren[i])
            oldIndexTable[i] = Usage.USED;
            i++; continue;
        }
        
        if (newInOldTable === undefined) {
            insertAction(actions, newChild, oldChildren[i]);
            j++; continue;
        }

        newChildren[j] = copyFiber(oldChildren[newInOldTable], newChild)
        moveAction(actions, oldChildren[newInOldTable], oldChildren[i]);
        oldIndexTable[newInOldTable] = Usage.USED;
        j++;
    }
    
    return actions
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