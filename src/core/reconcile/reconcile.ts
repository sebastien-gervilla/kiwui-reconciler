import { SageElementChildren, SageHTML } from "sage";
import { Fiber, FiberComponent, FiberHostElement, FiberHostText } from "../../classes";
import { isComponent, isFiberComponent, isFiberElement, isFiberText, isSageElement } from "../../utils/is-type";
import { commit } from "../commit";
import { createElement } from "../dom";
import { schedule, shouldYield } from "../schedule";
import { initializeDispatcher, resetCursor } from "../hooks";
import { diffing } from "./diffing";
import { isValidTag, isValidText } from "../../utils/validations";

let currentFiber: FiberComponent | null = null;
export const getCurrentFiber = () => currentFiber;

export const createFiberRoot = (root: HTMLElement) => {
    const tag = root.tagName.toLowerCase() as keyof SageHTML;
    if (!isValidTag(tag))
        throw new Error("Invalid root element.");

    initializeDispatcher();
    return new FiberHostElement(tag, {});
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
    if (isFiberComponent(fiber)) {
        // const memoFiber = memo(fiber)
        // if (memoFiber) {
        //     return memoFiber
        // }
        updateComponent(fiber);
    }

    if (isFiberElement(fiber) || isFiberText(fiber))
        updateHost(fiber);

    return fiber.child 
        ? fiber.child 
        : getSibling(fiber);
}

const getSibling = (fiber: Fiber) => {
    while (fiber) {
        if (fiber.isDirty) {
            fiber.isDirty = false;
            commit(fiber);
            return null;
        }
        if (fiber.sibling)
            return fiber.sibling;
        
        fiber = fiber.parent as any;
    }

    return null;
}

const updateComponent = (fiber: FiberComponent): any => {
    resetCursor();
    currentFiber = fiber;
    const children = fiber.component(fiber.props);
    reconcileChidren(fiber, children ? [children] : []);
}

const updateHost = (fiber: FiberHostElement | FiberHostText): void => {
    fiber.parentNode = getParentNode(fiber);
    if (!fiber.node) {
        // if (fiber.type === 'svg') fiber.lane |= TAG.SVG
        fiber.node = createElement(fiber) as HTMLElement;
    }
    reconcileChidren(fiber, isFiberElement(fiber) ? fiber.props.children || [] : []); // TODO: Don't reconcile text
}

const getParentNode = (fiber: Fiber) => {
    let parent = fiber.parent
    while (parent) {
        if (!isFiberComponent(parent)) 
            return parent.node

        parent = parent.parent;
    }

    // Root doesn't have parent
    if (fiber.type === 'Root')
        return {} as HTMLElement;

    throw new Error(`
        Couldn't find parent node.
        Root element doesn't exist.
    `);
}

const createFibersFromChildren = (children: SageElementChildren[]): Fiber[] => {
    let fibers: Fiber[] = [];
    for (const child of children) {
        if (!isSageElement(child)) {
            if (isValidText(child))
                fibers.push(new FiberHostText(`${child}`));
            continue;
        }

        fibers.push(
            isComponent(child)
                ? new FiberComponent(child.type, child.props)
                : new FiberHostElement(child.type, child.props)
        );
    }
    
    return fibers;
}

const reconcileChidren = (fiber: Fiber, children: SageElementChildren[]): void => { // TODO: SageNode ?
    const currentChildren = fiber.kids || [];
    const domChildren = (fiber.kids = createFibersFromChildren(children));

    const actions = diffing(currentChildren, domChildren)
  
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