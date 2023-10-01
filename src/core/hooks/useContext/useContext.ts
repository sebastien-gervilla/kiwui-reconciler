import { Context } from "kiwui";
import { getCurrentFiber } from "../../reconcile";
import { Fiber, FiberComponent } from "../../../classes";

export const useContext = <T>(consumer: Context<T>): T => {
    let contextFiber = getCurrentFiber()?.parent;
    while (contextFiber && (!isFiberExotic<T>(contextFiber) || contextFiber.component !== consumer.Provider))
        contextFiber = contextFiber.parent

    if (!contextFiber) 
        return consumer.initialValue;

    return contextFiber.props.value;
}

const isFiberExotic = <T>(fiber: Fiber & any)
    : fiber is FiberComponent<Context<T>['Provider']> => 
        fiber.component?.exoticTag === 'Context';