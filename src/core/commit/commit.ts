import { Fiber, FiberComponent } from "../../classes"
import { HTMLElementEx } from "../../classes/Fiber/Fiber"
import { isFiberComponent, isFiberElement } from "../../utils/is-type"
import { updateElement } from "../dom"
import { TAG } from "../reconcile"

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

    // refer(fiber.ref, fiber.node)
  
    fiber.action = null
  
    commit(fiber.child)
    commit(fiber.sibling)
}

export const removeElement = (fiber: Fiber) => {
    if (isFiberComponent(fiber)) {
        fiber.hooks && fiber.hooks.states.forEach(state => state[2] && state[2]())
        fiber.kids.forEach(removeElement)
    } else {
        try {
            fiber.parentNode.removeChild(fiber.node)
        } catch (error) {
            throw new Error(error as string)
        }
        // kidsRefer(fiber.kids)
        // refer(fiber.ref, null)
    }
}

// const refer = (ref: IRef, dom?: HTMLElement): void => {
//     if (ref) isFn(ref) 
//         ? ref(dom) 
//         : ((ref as { current?: HTMLElement })!.current = dom)
// }
  
// const kidsRefer = (kids: any): void => {
//     kids.forEach(kid => {
//         kid.kids && kidsRefer(kid.kids)
//         refer(kid.ref, null)
//     })
// }

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
        let beforeNode: HTMLElementEx | null = before.node;
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