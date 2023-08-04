import { Dispatcher, SageNode } from "sage";
import { Fiber } from "../../classes";
import { isComponent, isFunction, isHTMLElement, isNumber, isString } from "../../utils/is-type";
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

    // Components
    if (isComponent(element)) {
        const { type, props } = element;
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

            if (!childFiber) return fiber;

            fiber.child = childFiber;
            childFiber.parent = fiber;
        } catch (error) {
            console.log(error); // TODO: Error handling ?
        } finally {
            return fiber;
        }
    }

    if (!isHTMLElement(element)) throw Error(`
        This isn't a valid HTML Element: \n
        1. It might not be supported by Sage yet.
        2. If you meant to render a Component, you need to capitalize the first character.
    `);

    // DOMElements
    const { type, props } = element;
    const fiber = new FiberHostElement(type, props || {});

    if (!props) return fiber;
    let children = props.children;

    // Sage transforms single nodes in arrays (so SageNode is technically impossible)
    if (!children || !Array.isArray(children)) return fiber;

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