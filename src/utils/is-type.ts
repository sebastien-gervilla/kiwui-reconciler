import { FunctionComponent, SageElement, SageHTML } from "sage";
import { isValidTag } from "./validations";
import { Fiber, FiberComponent, FiberHostElement } from "../classes";

export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';

export const isComponent = (value: SageElement): value is SageElement<FunctionComponent> => typeof value.type === 'function';

export const isHTMLElement = (element: SageElement): element is SageElement<keyof SageHTML> => 
    typeof element === 'object' && isValidTag(element.type);


// Fiber

export const isFiberComponent = (value: Fiber): value is FiberComponent => value instanceof FiberComponent;
export const isFiberElement = (value: Fiber): value is FiberHostElement => value instanceof FiberHostElement;