import { Dispatcher, SageElement } from "sage";
import { Fiber, FiberComponent } from "../../classes";
import { createFiberTree } from "../createFiberTree";
import { isFunction } from "../../utils/is-type";

const updateFiber = (fiber: FiberComponent, updateContainer: (rootFiber: Fiber) => void) => {
    if (!(fiber instanceof FiberComponent)) 
        throw Error("Tried to update non component fiber");

    let childFiber: SageElement | null = null;
    const { component, props } = fiber;

    try {
        let hooksIndex = 0;
        const previousHooks = [...fiber.hooks];
        fiber.hooks = [];

        Dispatcher.current = {
            useState(initialGetter) {
                let state: any;
                let fronzenHooksIndex = hooksIndex;

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
                        fiber.hooks[fronzenHooksIndex] = isFunction(newState) ?
                            newState(state) : newState;

                        updateFiber(fiber, updateContainer);
                    }
                ]
            },
        }
        
        childFiber = component(props);
    } catch (error) {
        console.log(error); // TODO: Error handling ?
    }

    if (!childFiber) throw Error('Component must return element'); // TODO: Handle null returns

    const subTree = createFiberTree(childFiber, updateContainer);
    fiber.child = subTree || null;

    let rootFiber: Fiber = fiber;
    while (rootFiber.parent)
        rootFiber = rootFiber.parent;

    updateContainer(rootFiber);
}

export default updateFiber;