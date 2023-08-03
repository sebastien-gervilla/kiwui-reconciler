import { Dispatcher, SageHTML, SageNode } from "sage";
import { Fiber } from "../../classes";
import { isFunction, isNumber, isString } from "../../utils/is-type";
import { FiberComponent, FiberHostElement, FiberHostText } from "../../classes/Fiber";
import updateFiber from "../updateFiber/updateFiber";

const createFiberTree = (element: SageNode, updateContainer: (rootFiber: Fiber) => void) => {
    if (Array.isArray(element)) return;
    
    // ==> Fiber verifications
    if (!element || typeof element === 'boolean')
        return;

    // ==> Fiber creation

    // Expressions
    if (isString(element) || isNumber(element))
        return new FiberHostText(element.toString());

    const { type, props } = element;

    // Components
    if (isFunction(type)) {
        const component = type;
        const componentProps = props || {};

        const fiber = new FiberComponent(component, componentProps);
        try {
            let hooksIndex = 0;
            const previousHooks = [...fiber.hooks];
            fiber.hooks = [];

            Dispatcher.current = {
                useState(initialGetter) {
                    let state: any;
                    let frozenHooksIndex = hooksIndex;

                    if (!(hooksIndex in previousHooks)) {
                        // Initializing the state
                        state = isFunction(initialGetter) ? 
                            initialGetter() : initialGetter;
                    } else {
                        state = previousHooks[hooksIndex];
                    }

                    fiber.hooks.push(state);
                    hooksIndex++;

                    return [
                        state,
                        (newState) => {
                            // TODO: What happens when the user "setStates" ?
                            fiber.hooks[frozenHooksIndex] = isFunction(newState) ?
                                newState(state) : newState;

                            updateFiber(fiber, updateContainer);
                        }
                    ]
                },
            }
            
            const functionElement = component(componentProps);
            const childFiber = createFiberTree(functionElement, updateContainer);
            console.log("childFiber : ", childFiber);
            
            fiber.child = childFiber || null;
        } catch (error) {
            console.log(error); // TODO: Error handling ?
        }
        return fiber;
    }

    if (typeof element !== 'object') return;

    // DOMElements
    const fiber = new FiberHostElement(type, props || {});
    if (!props) return fiber;

    let children = ('children' in props) ? 
        props.children : null;

    if (!children || !Array.isArray(children)) return;

    // ==> Fiber children creation
    let firstChild: Fiber | null = null;
    let previousFiber: Fiber | null = null;
    
    // Array handling (Temporary)
    // @ts-ignore
    // Ignored this error because we want to indefinitely flatten the array,
    // while letting the user handle the problem. (shouldn't be sage's job).
    children = children.flat(Infinity);
    for (const child of children) {
        const childFiber = createFiberTree(child, updateContainer);
        if (!childFiber) continue;

        childFiber.parent = fiber;

        if (previousFiber)
            previousFiber.sibling = childFiber;

        if (!firstChild)
            firstChild = childFiber;

        previousFiber = childFiber
    }

    fiber.child = firstChild;
    return fiber;
}

export default createFiberTree;