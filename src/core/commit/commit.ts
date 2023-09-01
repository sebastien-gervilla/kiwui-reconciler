import { Fiber, FiberComponent } from "../../classes"
import { isFiberComponent, isFiberElement } from "../../utils/is-type"
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
    if ((op & TAG.INSERT || op & TAG.MOVE) && element)
        insertFiber(fiber, element, before);

    if (op & TAG.UPDATE)
        updateFiber(fiber);
  
    fiber.action = null
  
    commit(fiber.child)
    commit(fiber.sibling)
}

export const removeElement = (fiber: Fiber) => {
    if (isFiberComponent(fiber))
        return fiber.kids.forEach(removeElement);

   fiber.parentNode.removeChild(fiber.node);
}

const insertBefore = (fiber: Fiber, element: Fiber, after: Node | null) =>
    fiber.parentNode.insertBefore(element.node, after);

const insertFiber = (fiber: Fiber, element: Fiber, before: Fiber | undefined) => {
    if (isFiberComponent(fiber) && fiber.child) {
        if (fiber.action && fiber.child.action) {
            fiber.child.action.op |= fiber.action.op
            fiber.child.action.before = fiber.action.before // TODO: Fragments support
        }
        return;
    }

    if (!before)
        insertBefore(fiber, element, null)
    else {
        let beforeNode: HTMLElement | null = before.node;
        if (before instanceof FiberComponent)
            beforeNode = getBeforeNode(before)

        insertBefore(fiber, element, beforeNode)
    }
}

const updateFiber = (fiber: Fiber) => {
    if (isFiberComponent(fiber) && fiber.child) {
        if (fiber.action && fiber.child.action)
            fiber.child.action.op |= fiber.action.op
        return;
    }

    const hasProps = 
        isFiberComponent(fiber) || 
        isFiberElement(fiber);

    if (!hasProps) return;

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