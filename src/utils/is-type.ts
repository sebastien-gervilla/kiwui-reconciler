import { FunctionComponent, SageElement, SageHTML } from "sage";
import { isValidTag } from "./validations";

export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';

export const isComponent = (value: SageElement): value is SageElement<FunctionComponent> => typeof value.type === 'function';

export const isHTMLElement = (element: SageElement): element is SageElement<keyof SageHTML> => 
    typeof element.type === 'object' && isValidTag(element.type);