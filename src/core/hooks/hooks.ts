import { Dependencies, Dispatcher } from 'kiwui';
import { FiberComponent } from '../../classes'
import { getCurrentFiber } from '../reconcile'
import { useState } from './useState';
import { useEffect, useLayoutEffect } from './useEffect';
import { EmptyHook, StoredHook } from './hooks.types';
import { isFiberComponent } from '../../utils/is-type';

// Tracking hooks
let cursor = 0;
export const resetCursor = () => cursor = 0;
export const incrementCursor = () => cursor++;

export const getHook = <Hook extends StoredHook>(
    cursor: number
): [Hook | EmptyHook, FiberComponent] => {
    const current = getCurrentFiber();
    if (!current || !isFiberComponent(current))
        throw new Error("Hooks can only be used in Function Components.");

    const hooks = current.hooks;

    // Add hook if not in it yet
    if (cursor >= hooks.length)
        hooks.push([]);

    return [
        hooks[cursor] as Hook | EmptyHook,
        current
    ];
}

export const hasDepsChanged = (oldDeps: Dependencies, newDeps: Dependencies) => {
    return !oldDeps 
        || oldDeps.length !== newDeps.length 
        || newDeps.some((dep, index) => !Object.is(dep, oldDeps[index]))
}

export const initializeDispatcher = () => {
    Dispatcher.current = {
        useState,
        useEffect,
        useLayoutEffect
    };
}