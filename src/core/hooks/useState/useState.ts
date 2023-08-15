import { Setter, StateGetter } from "sage";
import { isFunction } from "../../../utils/is-type";
import { getHook, incrementCursor } from "../hooks";
import { update } from "../../reconcile";

export const useState = <T>(initialState: T | (() => T)): [T, Setter<StateGetter<T>>] => {
    const [hook, fiber] = getHook<T>(incrementCursor());
    if (hook.length) return hook;

    // Initialize it if empty
    hook[0] = isFunction(initialState) 
        ? initialState() 
        : initialState;

    hook[1] = (getter: StateGetter<T>) => {
        const value = isFunction(getter)
            ? getter(hook[0])
            : getter;

        if (hook[0] !== value) {
            hook[0] = value;
            update(fiber);
        }
    }
    
    return hook;
}