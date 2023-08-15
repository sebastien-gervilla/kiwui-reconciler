import { Fiber } from "../classes";
import { isFiberComponent, isFiberElement } from "./is-type";

export const copyFiber = (oldFiber: Fiber, newFiber: Fiber) => {
    const isComponent = isFiberComponent(oldFiber);
    const isElement = isFiberElement(oldFiber);

    const { node, kids } = oldFiber;
    const oldProps = (isComponent || isElement) ? 
        oldFiber.props : null;
    const hooks = isComponent
        ? oldFiber.hooks
        : undefined

    const entries = Object.entries(newFiber) as 
        [keyof Fiber, Fiber[keyof Fiber]][];
        
    for (const [key, value] of entries)
        if (typeof value !== 'function')
            (oldFiber as any)[key] = value
    
    if (isComponent && hooks)
        oldFiber.hooks = hooks

    // b.ref = a.ref
    oldFiber.node = node // tempfix ?
    oldFiber.kids = kids

    if (isComponent || isElement)
        oldFiber.oldProps = oldProps;

    return oldFiber
}