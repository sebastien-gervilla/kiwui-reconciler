import { Fiber, FiberComponent } from '../../classes'
import { update, isFn, IEffect, getCurrentFiber } from './reconcile'
import { SageNode } from 'sage/dist/types'

export const useState = <T>(initState: T): [T, Dispatch<SetStateAction<T>>] => {
    return useReducer(null as any, initState)
}
  
export const useReducer = <S, A>(
    reducer?: Reducer<S, A>,
    initState?: S
): [S, Dispatch<A>] => {
    const [hook, current]: [any, FiberComponent] = getHook<S>(cursor++)
    if (hook.length === 0) {
        hook[0] = initState
        hook[1] = (value: A | Dispatch<A>) => {
            let v = reducer
            ? reducer(hook[0], value as any)
            : isFn(value)
                ? value(hook[0])
                : value
            if (hook[0] !== v) {
                hook[0] = v
                update(current)
            }
        }
    }
    return hook
}

export const getHook = <S = Function | undefined, Dependency = any>(
    cursor: number
): [[S, Dependency], FiberComponent] => {
    const current: FiberComponent = getCurrentFiber() as FiberComponent
    const hooks = current.hooks || (current.hooks = {
        states: [],
        effects: [],
        layouts: []
    });
    if (cursor >= hooks.states.length) {
        hooks.states.push([] as IEffect)
    }
    return [(hooks.states[cursor] as unknown) as [S, Dependency], current]
}
  
export type ContextType<T> = {
    ({ value, children }: { value: T, children: SageNode }): SageNode;
    initialValue: T;
}

const EMPTY_ARR = []

let cursor = 0

export const resetCursor = () => {
  cursor = 0
}

export type SetStateAction<S> = S | ((prevState: S) => S)
export type Dispatch<A> = (value: A, resume?: boolean) => void
export type Reducer<S, A> = (prevState: S, action: A) => S
