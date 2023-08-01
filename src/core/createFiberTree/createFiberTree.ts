import { Dispatcher, SageHTML, SageNode } from "sage";
import { Fiber } from "../../classes";
import { isFunction, isNumber, isString } from "../../utils/is-type";
import { FiberComponent, FiberHostElement, FiberHostText } from "../../classes/Fiber";

const createFiberTree = (element: SageNode) => {
    // ==> Fiber verifications
    if (!element || typeof element === 'boolean')
        return;

    // ==> Fiber creation

    // Expressions
    if (isString(element) || isNumber(element))
        return new FiberHostText(element.toString());

    // Components
    if (isFunction(element.type)) { // TODO: TypeGuards
        const fiber = new FiberComponent(element.type.name, element.props || {})
        try {
            Dispatcher.current = {
                useState: (initialGetter) => {
                    const initialState = isFunction(initialGetter) ? 
                        initialGetter() : initialGetter;

                    fiber.hooks.push(initialState);

                    return [
                        initialState,
                        (newState) => {
                            // TODO: What happens when the user "setStates" ?
                            fiber.hooks.push(
                                isFunction(newState) ?
                                    newState(initialState) : newState
                            )
                        }
                    ]
                },
            }
            
            const functionElement = element.type(element.props || {});
            const childFiber = createFiberTree(functionElement);
            fiber.child = childFiber || null;
        } catch (error) {
            console.log(error); // TODO: Error handling ?
        }
        return fiber;
    }

    if (typeof element !== 'object') return;
    const { type, props } = element;

    // DOMElements
    const tag = type as keyof SageHTML;
    const fiber = new FiberHostElement(tag, props || {});
    if (!props) return fiber;

    const children = ('children' in props) ? 
        props.children : null;

    if (!children || !Array.isArray(children)) return;

    // ==> Fiber children creation
    let firstChild: Fiber | null = null;
    let previousFiber: Fiber | null = null;
    for (const child of children) {
        const childFiber = createFiberTree(child);
        if (!childFiber) continue;

        childFiber.parent = fiber;

        if (previousFiber) // TODO: Careful, doing that means "fiber" do not have nextSibling set yet
            previousFiber.sibling = childFiber;

        if (!firstChild)
            firstChild = childFiber;

        previousFiber = childFiber
    }

    fiber.child = firstChild;
    return fiber;
}

export default createFiberTree;