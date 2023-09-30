import { Fiber } from "../classes";
import { isFiberComponent, isFiberElement } from "./is-type";

// NOTE: We assign the new fiber to the old one, thus keeping old and new tree synchronized.
// With this, multiple state changes on the same component references always the same fiber.
export const copyFiber = (oldFiber: Fiber, newFiber: Fiber) => {
    const isComponent = isFiberComponent(oldFiber);
    const isElement = isFiberElement(oldFiber);

    const oldProps = (isComponent || isElement)
        ? oldFiber.props
        : null;

    const hooks = isComponent 
        ? (oldFiber as any).hooks
        : undefined;

    const { kids, node } = oldFiber;

    let key: keyof Fiber;
    for (key in newFiber)
        if (typeof newFiber[key] !== 'function')
            (oldFiber as any)[key] = newFiber[key]

    oldFiber.kids = kids;
    oldFiber.node = node;

    if (isComponent && hooks)
        oldFiber.hooks = hooks;

    if (isComponent || isElement)
        oldFiber.oldProps = oldProps;

    return oldFiber;
}