import { Reference } from "kiwui";
import { Fiber, FiberComponent, FiberHostElement } from "../../classes"
import { FiberHost } from "../../types";
import { isFiberComponent, isFiberElement, isFiberHost, isFiberPortal, isFunction } from "../../utils/is-type"
import { updateElement } from "../dom"
import { TAG } from "../reconcile/reconcile.types";

export const commit = (fiber: Fiber | null) => {
    if (!fiber) return;

    if (!fiber.action) {
        commit(fiber.child);
        commit(fiber.sibling);
        return;
    }

    const { op, element, before } = fiber.action;
    if ((op & TAG.INSERT || op & TAG.MOVE) && element) {
        if (isFiberComponent(fiber))
            insertComponent(fiber);

        if (isFiberHost(fiber) && isFiberHost(element))
            insertFiberHost(fiber, element, before);
    }

    if (op & TAG.UPDATE) {
        if (isFiberComponent(fiber))
            updateComponent(fiber);

        if (isFiberElement(fiber))
            updateHostElement(fiber);
    }

    if (isFiberElement(fiber) && fiber.ref)
        reference(fiber.ref, fiber.node);
  
    fiber.action = null;
  
    commit(fiber.child);
    commit(fiber.sibling);
}

export const removeElement = (fiber: Fiber) => {
    if (isFiberComponent(fiber))
        return fiber.kids.forEach(removeElement);

    fiber.parentNode.removeChild(fiber.node); // fiber.node.remove()
    if (isFiberElement(fiber)) {
        referenceKids(fiber.kids);
        if (fiber.ref)
            reference(fiber.ref, fiber.node);
    }
}

const reference = <T extends HTMLElement>(ref: Reference<T | null>, element: T | null) => {
    isFunction(ref) 
        ? ref(element) 
        : ref.current = element;
}

const referenceKids = (kids: Fiber[]) => {
    if (kids.length) return;

    for (const kid of kids) {
        referenceKids(kid.kids);
        if (isFiberElement(kid) && kid.ref)
            reference(kid.ref, null);
    }
}

const insertBefore = (fiber: FiberHost, element: FiberHost, before: Node | null) =>
    fiber.parentNode.insertBefore(element.node, before);

const insertFiberHost = (fiber: FiberHost, element: FiberHost, before: Fiber | undefined) => {
    if (fiber.parent && isFiberComponent(fiber.parent) && isFiberPortal(fiber.parent))
        return fiber.parent.component.container.insertBefore(element.node, before?.node);

    if (!before)
        return insertBefore(fiber, element, null);

    let beforeNode = before.node;
    if (isFiberComponent(before))
        beforeNode = getBeforeNode(before);

    return insertBefore(fiber, element, beforeNode);
}

const insertComponent = (fiber: FiberComponent) => {
    if (!fiber.child?.action || !fiber.action)
        return;

    let { op, before } = fiber.action;
    fiber.child.action.op |= op;
    fiber.child.action.before = before;

    let sibling = fiber.child.sibling;
    while (sibling) {
        if (sibling.action) {
            sibling.action.op |= op;
            sibling.action.before = before;
        }
        sibling = sibling.sibling;
    }
}

const updateComponent = (fiber: FiberComponent) => {
    if (!fiber.action || !fiber.child?.action)
        return;
    
    fiber.child.action.op |= fiber.action.op;
    let sibling = fiber.child.sibling;
    while (sibling) {
        if (sibling.action)
            sibling.action.op |= fiber.action.op;
        sibling = sibling.sibling;
    }
}

const updateHostElement = (fiber: FiberHostElement) => {
    updateElement(
        fiber.node, 
        fiber.oldProps || {}, 
        fiber.props || {}
    );
}

const getBeforeNode = (fiberComponent: FiberComponent) => {
    if (!fiberComponent.child) return null;

    fiberComponent.isGettingNode = true;
    let fiber: Fiber | null = fiberComponent;

    const getSibling = (fiber: Fiber) => {
        let siblingFiber: Fiber | null = fiber;
        while (siblingFiber) {
            if (siblingFiber.sibling)
                return siblingFiber.sibling;
    
            siblingFiber = siblingFiber.parent;
            if (siblingFiber?.isGettingNode)
                return null;
        }

        return null;
    }

    while (fiber && isFiberComponent(fiber)) {
        if (fiber.child) {
            fiber = fiber.child;
            continue;
        }

        fiber = getSibling(fiber);
    }

    return fiber?.node || null;
}