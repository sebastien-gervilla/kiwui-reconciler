import { Fiber, FiberComponent, FiberHostElement } from "../../classes"
import { FiberHost } from "../../types";
import { isFiberComponent, isFiberElement, isFiberHost } from "../../utils/is-type"
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
  
    fiber.action = null;
  
    commit(fiber.child);
    commit(fiber.sibling);
}

export const removeElement = (fiber: Fiber) => {
    if (isFiberComponent(fiber))
        return fiber.kids.forEach(removeElement);

   fiber.parentNode.removeChild(fiber.node);
}

const insertBefore = (fiber: FiberHost, element: FiberHost, before: Node | null) =>
    fiber.parentNode.insertBefore(element.node, before);

const insertFiberHost = (fiber: FiberHost, element: FiberHost, before: Fiber | undefined) => {
    if (!before)
        return insertBefore(fiber, element, null);

    let beforeNode = before.node;
    if (isFiberComponent(before))
        beforeNode = getBeforeNode(before);

    return insertBefore(fiber, element, beforeNode);
}

const insertComponent = (fiber: FiberComponent) => {
    if (!fiber.child || !fiber.action || !fiber.child.action) // TODO: Clean
        return;

    fiber.child.action.op |= fiber.action.op
    fiber.child.action.before = fiber.action.before

    let sibling = fiber.child.sibling;
    while (sibling) {
        if (sibling.action) {
            sibling.action.op |= fiber.action.op;
            sibling.action.before = fiber.action.before;
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