import { FunctionComponent, SageElement, SageElementChildren, SageHTML } from "sage";
import { Fiber, FiberComponent, FiberHostElement, FiberHostText } from "../classes";
import { isValidTag } from "./validations";
import { EmptyHook, StoredHook } from "../core/hooks/hooks.types";

export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';

export const isComponent = (value: SageElement): value is SageElement<FunctionComponent> => typeof value.type === 'function';

export const isHTMLElement = (element: SageElement): element is SageElement<keyof SageHTML> => 
    typeof element === 'object' && isValidTag(element.type);

export const isSageElement = (value: SageElementChildren): value is SageElement => 
    !!value && typeof value === 'object';

// Fiber

export const isFiberComponent = (value: Fiber): value is FiberComponent => value instanceof FiberComponent;
export const isFiberElement = (value: Fiber): value is FiberHostElement => value instanceof FiberHostElement;
export const isFiberText = (value: Fiber): value is FiberHostText => value instanceof FiberHostText;

// Hook

export const isEmptyHook = (hook: StoredHook | EmptyHook): hook is EmptyHook => hook.length === 0