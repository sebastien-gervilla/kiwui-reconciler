import { Hooks, StateGetter } from "kiwui";
import { isEmptyHook, isFunction } from "../../../utils/is-type";
import { getHook, incrementCursor } from "../hooks";
import { update } from "../../reconcile";
import { StoredState } from "../hooks.types";

export const useState: Hooks['useState'] = <T>(initialState: T | (() => T)) => {
    const [hook, fiber] = getHook<StoredState>(incrementCursor());
    if (!isEmptyHook(hook)) return hook;

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
    
    return hook as StoredState<T>;
}