import { SageElement, SageElementChildren, SageHTML } from "sage";
import { Fiber, FiberComponent, FiberHostElement, FiberHostText } from "../../classes";
import { isComponent, isSageElement } from "../../utils/is-type";
import { commit, removeElement } from "../commit";
import { Action, HTMLElementEx } from "../../classes/Fiber/Fiber";
import { createElement } from "../dom";
import { schedule, shouldYield } from "../schedule";
import { resetCursor } from "../hooks";
import { Effect } from "../hooks/hooks.types";

let currentFiber: Fiber | null = null;
export const getCurrentFiber = () => currentFiber || null

let rootFiber: Fiber | null = null
export const render = (vnode: SageElement<keyof SageHTML>, node: HTMLElementEx): void => {
    rootFiber = new FiberHostElement('div', { children: [vnode] })
    rootFiber.node = node
    update(rootFiber)
}

export const update = (fiber: Fiber) => {
    if (!fiber.isDirty) {
        fiber.isDirty = true;
        schedule(() => reconcile(fiber));
    }
}

const reconcile = (fiber?: Fiber): Function | null => {
    while (fiber && !shouldYield())
        fiber = capture(fiber) as Fiber;

    if (!fiber) return null;

    return reconcile.bind(null, fiber);
}

// Tag all fibers for updates
const capture = (fiber: Fiber): Fiber | undefined | null => {
    if (fiber instanceof FiberComponent) {
        // const memoFiber = memo(fiber)
        // if (memoFiber) {
        //     return memoFiber
        // }
        updateHook(fiber);
    }

    if (fiber instanceof FiberHostElement || fiber instanceof FiberHostText) {
        updateHost(fiber);
    }

    return fiber.child 
        ? fiber.child 
        : getSibling(fiber);
}

const getSibling = (fiber: Fiber) => {
    while (fiber) {
        bubble(fiber)
        if (fiber.isDirty) {
            fiber.isDirty = false
            commit(fiber)
            return null
        }
        if (fiber.sibling) return fiber.sibling
        fiber = fiber.parent as any
    }
    return null
}

const side = (effects: Effect[]): void => {
    effects.forEach(e => e[2] && e[2]())
    effects.forEach(e => (e[2] = e[0]?.()))
    effects.length = 0
}
// Execute hooks
const bubble = (fiber: Fiber) => {
    if (!(fiber instanceof FiberComponent))
        return;

    if (fiber.hooks) {
        side(fiber.hooks.layouts)
        schedule(() => side(fiber.hooks.effects))
    }
}

const updateHook = (fiber: FiberComponent): any => {
    resetCursor()
    currentFiber = fiber
    const children = fiber.component(fiber.props)
    reconcileChidren(fiber, children ? [children] : [])
}

const updateHost = (fiber: FiberHostElement | FiberHostText): void => {
    fiber.parentNode = (getParentNode(fiber) as any) || {}
    if (!fiber.node) {
        // if (fiber.type === 'svg') fiber.lane |= TAG.SVG
        fiber.node = createElement(fiber) as HTMLElementEx
    }
    reconcileChidren(fiber, fiber instanceof FiberHostElement ? fiber.props.children || [] : [])
}

const getParentNode = (fiber: Fiber): HTMLElement | undefined => {
    let parent = fiber.parent
    while (parent) {
        if (!(parent instanceof FiberComponent)) 
            return parent.node

        parent = parent.parent;
    }

    return undefined
}

const createFibersFromChildren = (children: SageElementChildren[]): Fiber[] => {
    return children.map(child => 
        isSageElement(child)
            ? isComponent(child)
                ? new FiberComponent(child.type, child.props)
                : new FiberHostElement(child.type, child.props)
            : new FiberHostText(`${child}`)
    );
}

const reconcileChidren = (fiber: Fiber, children: SageElementChildren[]): void => { // TODO: SageNode ?
    const currentChildren = fiber.kids || [];
    const domChildren = (fiber.kids = createFibersFromChildren(children));

    const actions = diff(currentChildren, domChildren)
  
    let previous = null;
    for (let i = 0; i < domChildren.length; i++) {
        const child = domChildren[i]
        child.action = actions[i]
        // if (fiber.lane & TAG.SVG) {
        //     child.lane |= TAG.SVG
        // }
        child.parent = fiber
        if (i > 0 && previous)
            previous.sibling = child
        else
            fiber.child = child

        previous = child
    }
}

const diff = (oldChildren: Fiber[], newChildren: Fiber[]) => {
    var actions: Action[] = [];
    let oldTable: KeysTable = {};
    let newTable: KeysTable = {};

    const getKey = (fiber: Fiber) => {
        if (fiber instanceof FiberComponent || fiber instanceof FiberHostElement)
            return fiber.key + fiber.tag;

        if (fiber instanceof FiberHostText)
            return fiber.content;

        throw new Error('Unsupported fiber.');
    }
    
    let i, j;

    // TODO: Huge problem, if elements have no keys of same type, it won't push it
    // Here warning, put keys when array ?
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
        
        if (oldChild === null || oldIndexTable[i] === 1) { // TODO: unsed & used enum
            i++;
            continue;
        }
        
        if (newChildren.length <= j) {
            removeElement(oldChildren[i])
            i++;
            continue;
        } 
        
        if (oldChildren.length <= i) {
            actions.push({ op: TAG.INSERT, element: newChild, before: oldChildren[i] })
            j++;
            continue;
        }
        
        if (getKey(oldChild) === getKey(newChild)) {
            newChildren[j] = copyFiber(oldChild, newChild) // Don't clone, just update

            actions.push({ op: TAG.UPDATE })
            i++; j++;
            continue;
        }
        
        var oldInNewTable = newTable[getKey(oldChild)]
        var newInOldTable = oldTable[getKey(newChild)]

        if (oldInNewTable === undefined) {
            removeElement(oldChildren[i])
            oldIndexTable[i] = 1; // Mark as used
            i++;
        } else if (newInOldTable === undefined) {
            actions.push({ op: TAG.INSERT, element: newChild, before: oldChildren[i] })
            j++
        } else {
            newChildren[j] = copyFiber(oldChildren[newInOldTable], newChild)
            actions.push({ op: TAG.MOVE, element: oldChildren[newInOldTable], before: oldChildren[i] })
            oldIndexTable[newInOldTable] = 1; // Mark as used
            j++
        }
    }
    return actions
}

/**
 * @deprecated Cloning actually causes desynchronisation between parallel updates
 */
function clone(oldFiber: Fiber, newFiber: Fiber) {
    const areComponents = 
        oldFiber instanceof FiberComponent && 
        newFiber instanceof FiberComponent;

    const areElements = 
        oldFiber instanceof FiberHostElement && 
        newFiber instanceof FiberHostElement;

    if (areComponents)
        newFiber.hooks = oldFiber.hooks

    // b.ref = a.ref
    newFiber.node = oldFiber.node // tempfix ?
    newFiber.kids = oldFiber.kids

    if (areElements || areComponents)
        newFiber.oldProps = oldFiber.props
}

const copyFiber = (oldFiber: Fiber, newFiber: Fiber) => {
    const isComponent = oldFiber instanceof FiberComponent;
    const isElement = oldFiber instanceof FiberHostElement;

    const { node, kids } = oldFiber;
    const oldProps = (isComponent || isElement) ? 
        oldFiber.props : null;
    const hooks = oldFiber instanceof FiberComponent
        ? oldFiber.hooks
        : undefined

    const entries = Object.entries(newFiber) as 
        [keyof Fiber, Fiber[keyof Fiber]][];
        
    for (const [key, value] of entries)
        if (typeof value !== 'function')
            (oldFiber as any)[key] = value
    
    if (oldFiber instanceof FiberComponent && hooks)
        oldFiber.hooks = hooks

    // b.ref = a.ref
    oldFiber.node = node // tempfix ?
    oldFiber.kids = kids

    if (isComponent || isElement)
        oldFiber.oldProps = oldProps;

    return oldFiber
}

export const enum TAG {
    UPDATE = 1 << 1,
    INSERT = 1 << 2,
    REMOVE = 1 << 3,
    SVG = 1 << 4,
    DIRTY = 1 << 5,
    MOVE = 1 << 6,
    REPLACE = 1 << 7
}

type KeysTable = {
    [key: string]: number
}