import { Fiber, FiberComponent, FiberHostElement } from "../classes";
import { isFiberComponent, isFiberElement } from "./is-type";

// NOTE: We assign the new fiber to the old one, thus keeping old and new tree synchronized.
// With this, multiple state changes on the same component references always the same fiber.
export const copyFiber = (oldFiber: Fiber, newFiber: Fiber) => {
    const isComponent = isFiberComponent(oldFiber);
    const isElement = isFiberElement(oldFiber);

    let oldProps: any | null = null;
    let oldHooks!: FiberComponent['hooks'];
    let oldRef: FiberHostElement['ref'];
    if (isComponent) {
        oldProps = oldFiber.props;
        oldHooks = oldFiber.hooks
    }
    else if (isElement) {
        oldProps = oldFiber.props;
        oldRef = oldFiber.ref;
    }

    const { kids, node } = oldFiber;

    let key: keyof Fiber;
    for (key in newFiber)
        if (typeof newFiber[key] !== 'function')
            (oldFiber as any)[key] = newFiber[key]

    oldFiber.kids = kids;
    oldFiber.node = node;

    if (isComponent) {
        oldFiber.oldProps = oldProps;
        oldFiber.hooks = oldHooks;
    } 
    else if (isElement) {
        oldFiber.oldProps = oldProps;
        oldFiber.ref = oldRef;
    }

    return oldFiber;
}