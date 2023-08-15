import { FiberComponent } from '../../classes'
import { getCurrentFiber } from '../reconcile'
import { Effect } from './hooks.types'

// Tracking hooks
let cursor = 0;
export const resetCursor = () => cursor = 0;
export const incrementCursor = () => cursor++;

export const getHook = <State = Function | undefined, Dependency = any>(
    cursor: number
): [[State, Dependency], FiberComponent] => {
    const current = getCurrentFiber();
    if (!(current instanceof FiberComponent))
        throw new Error("useState can only be used in Function Components.");

    // Get hooks or initialize them
    const hooks = current.hooks || (current.hooks = {
        states: [],
        effects: [],
        layouts: []
    });

    // Add state arrays if not done already
    if (cursor >= hooks.states.length)
        hooks.states.push([] as Effect)

    return [
        hooks.states[cursor] as [State, Dependency], 
        current
    ]
}