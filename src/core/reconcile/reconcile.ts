import { SingleKiwuiNode, KiwuiHTML, MemoComponent, KiwuiNode } from "kiwui";
import { Fiber, FiberComponent, FiberHostElement, FiberHostText } from "../../classes";
import { isComponent, isFiberComponent, isFiberElement, isFiberMemo, isFiberText, isKiwuiElement } from "../../utils/is-type";
import { commit } from "../commit";
import { createElement, createText } from "../dom";
import { schedule, shouldYield } from "../schedule";
import { initializeDispatcher, resetCursor } from "../hooks";
import { diffing } from "./diffing";
import { isValidTag, isValidText } from "../../utils/validations";
import { StoredEffect } from "../hooks/hooks.types";
import { TAG } from "./reconcile.types";
import { flattenNode } from "../../utils/flatten-node";

let currentFiber: FiberComponent | null = null;
export const getCurrentFiber = () => currentFiber;

// TODO: This system could be removed, see "ideas"
let currentUpdatedFiber: Fiber | null = null;

export const createFiberRoot = (root: HTMLElement) => {
    const tag = root.tagName.toLowerCase() as keyof KiwuiHTML;
    if (!isValidTag(tag))
        throw new Error("Invalid root element.");

    initializeDispatcher();
    return new FiberHostElement(tag, {});
}

export const update = (fiber: Fiber) => {
    if (!fiber.isDirty) {
        fiber.isDirty = true;
        schedule(() => {
            currentUpdatedFiber = fiber;
            return reconcile(fiber);
        });
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
        if (!shouldUpdateComponent(fiber))
            return getSibling(fiber);

        updateComponent(fiber);
    }

    else if (isFiberElement(fiber))
        updateHost(fiber);

    else if (isFiberText(fiber))
        updateText(fiber);

    return fiber.child 
        ? fiber.child 
        : getSibling(fiber);
}

const getSibling = (fiber: Fiber) => {
    while (fiber) {
        if (isFiberComponent(fiber))
            bubble(fiber)

        if (fiber === currentUpdatedFiber) {
            currentUpdatedFiber = null;
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

const childrenToArray = (children: KiwuiNode): SingleKiwuiNode[] => {
    return Array.isArray(children)
        ? flattenNode(children)
        : [children];
}

const updateComponent = (fiber: FiberComponent): any => {
    resetCursor();
    currentFiber = fiber;
    const children = fiber.component(fiber.props);
    reconcileChidren(fiber, childrenToArray(children));
}

const shouldUpdateComponent = (fiber: FiberComponent) => {
    if (!isFiberMemo(fiber) || !fiber.oldProps)
        return true;

    const shouldUpdate = fiber.component.shouldUpdate || defaultShouldUpdate;
    return shouldUpdate(fiber.props, fiber.oldProps);
}

const defaultShouldUpdate = <Props extends {}>(newProps: Props, oldProps: Props) => {
    for (let prop in newProps)
        if (!(prop in oldProps)) return true;

    for (let prop in oldProps)
        if (newProps[prop] !== oldProps[prop]) return true;
    
    return false;
}

const bubble = (fiber: FiberComponent) => {
    if (fiber.layouts.length)
        side(fiber.layouts);

    if (fiber.effects.length)
        schedule(() => side(fiber.effects));
}

const side = (effects: StoredEffect[]) => {
    for (const effect of effects)
        effect[2] && effect[2]();

    for (const effect of effects)
        effect[2] = effect[0]() || undefined;

    effects.length = 0;
}

const updateHost = (fiber: FiberHostElement) => {
    fiber.parentNode = getParentNode(fiber);
    if (!fiber.node) {
        if (fiber.tag === 'svg') fiber.lane |= TAG.SVG;
        fiber.node = createElement(fiber) as HTMLElement;
    }
    reconcileChidren(fiber, childrenToArray(fiber.props.children));
}

const updateText = (fiber: FiberHostText) => {
    fiber.parentNode = getParentNode(fiber);
    if (!fiber.node)
        fiber.node = createText(fiber);
}

const getParentNode = (fiber: Fiber) => {
    let parent = fiber.parent;
    while (parent) {
        if (!isFiberComponent(parent)) 
            return parent.node;

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

const createFibersFromChildren = (children: SingleKiwuiNode[]): Fiber[] => {
    let fibers: Fiber[] = [];
    for (const child of children) {
        if (!isKiwuiElement(child)) {
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

const reconcileChidren = (fiber: FiberComponent | FiberHostElement, children: SingleKiwuiNode[]): void => {
    const currentChildren = fiber.kids || [];
    const domChildren = (fiber.kids = createFibersFromChildren(children));

    const actions = diffing(currentChildren, domChildren);
  
    let previous = null;
    for (let i = 0; i < domChildren.length; i++) {
        const child = domChildren[i];
        child.action = actions[i];

        if (fiber.lane & TAG.SVG)
            child.lane |= TAG.SVG;

        child.parent = fiber;
        if (i > 0 && previous)
            previous.sibling = child;
        else
            fiber.child = child;

        previous = child;
    }
}