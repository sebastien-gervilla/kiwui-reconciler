import { Fiber, FiberComponent, FiberHostElement } from "../../classes"
import { HTMLElementEx } from "../../classes/Fiber/Fiber"
import { updateElement } from "./dom"
import { TAG } from "./reconcile"

export const removeElement = (fiber: Fiber) => {
    if (fiber instanceof FiberComponent) {
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

const insertBefore = (fiber: Fiber, element: Fiber, after: Node | null) => {
    try {
        fiber.parentNode.insertBefore(element.node, after);
    } catch (error) {
        console.error(
            "Error with :",
            "fiber :", fiber,
            "element :", element,
            "after: ", after,
            error
        );

        throw new Error();
    }
}

export const commit = (fiber: Fiber | null) => {
    if (!fiber) return;

    const { op, before, element } = fiber.action || {};
    if (op) {
        if ((op & TAG.INSERT || op & TAG.MOVE) && element) {
            if ((fiber instanceof FiberComponent) && fiber.child) {
                if (fiber.action && fiber.child.action) {
                    fiber.child.action.op |= fiber.action.op
                    fiber.child.action.before = fiber.action.before // TODO: Fragments
                }
            }
            else {
                if (!before)
                    insertBefore(fiber, element, null)
                else {
                    let beforeNode: HTMLElementEx | null = before.node;
                    if (before instanceof FiberComponent)
                        beforeNode = getBeforeNode(before)

                    insertBefore(fiber, element, beforeNode)
                }
            }
        }

        if (op & TAG.UPDATE) {
            if ((fiber instanceof FiberComponent) && fiber.child) {
                if (fiber.action && fiber.child.action)
                    fiber.child.action.op |= fiber.action.op
            }
            else {
                const hasProps = 
                    fiber instanceof FiberComponent || 
                    fiber instanceof FiberHostElement;

                const oldProps = hasProps ?
                    fiber.oldProps : {};
                const newProps = hasProps ?
                    fiber.props : {};

                updateElement(
                    fiber.node, 
                    oldProps || {}, 
                    newProps || {}
                );
            }
        }
    }

    // refer(fiber.ref, fiber.node)
  
    fiber.action = null
  
    commit(fiber.child)
    commit(fiber.sibling)
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

    while (fiber instanceof FiberComponent) {
        if (fiber.child) {
            fiber = fiber.child;
            continue;
        }

        fiber = getSibling(fiber);
    }

    return fiber?.node || null;
}