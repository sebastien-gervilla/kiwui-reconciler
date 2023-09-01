import { FiberHostElement, FiberHostText } from '../../classes'
import { CSSProperties, HTMLAttributes } from 'kiwui'
import { isFiberText } from '../../utils/is-type'
import { TAG } from '../reconcile/reconcile.types';

// TODO: Relocation to kiwui-dom-bindings ?

export const createElement = (fiber: FiberHostText | FiberHostElement) => {
    if (isFiberText(fiber))
        return document.createTextNode(fiber.content);

    const element = fiber.lane & TAG.SVG
        ? document.createElementNS(SVG_URL, fiber.tag)
        : document.createElement(fiber.tag);

    updateElement(element, {}, fiber.props);

    return element;
}

export const updateElement = (
    element: DOM,
    oldProps: HTMLAttributes,
    newProps: HTMLAttributes
) => {
    for (const key in oldProps)
        if (isKeyInProps(key, oldProps))
            updateElementProps(element, key, oldProps[key], newProps[key]);

    // To fill keys not in oldKeys
    for (const key in newProps)
        if (isKeyInProps(key, newProps) && !oldProps.hasOwnProperty(key))
            updateElementProps(element, key, undefined, newProps[key]);
}

const applyStyles = (element: DOM, oldStyles: CSSProperties, newStyles: CSSProperties) => {
    let styleKey: keyof CSSProperties;

    // Apply new properties
    for (styleKey in newStyles)
        if (newStyles[styleKey] !== oldStyles[styleKey])
            // @ts-ignore - readonly style prevents from modifying its values
            element.style[styleKey] = newStyles[styleKey]?.toString() || '';

    // Reset old properties
    for (styleKey in oldStyles)
        if (!(styleKey in newStyles))
            // @ts-ignore - Same as above
            element.style[styleKey] = ''
};

const updateElementProps = (element: DOM, name: keyof HTMLAttributes, oldProp: HTMLAttributesValue, newProp: HTMLAttributesValue) => {
    if (oldProp === newProp || name === 'children')
        return;

    if (isStyleProps(name, newProp))
        return applyStyles(element, newProp, oldProp as CSSProperties);

    if (isEvent(name, newProp)) {
        // TODO: Support more listeners
        const type = name.slice(2).toLowerCase();
        if (oldProp) element.removeEventListener(type, oldProp as EventListener);
        return element.addEventListener(type, newProp);
    }
    
    if (name in element && !(element instanceof SVGElement)) {
        // @ts-ignore - This ignores "style" readonly error
        element[name] = newProp || '';
        return;
    }
    
    if (newProp === null || newProp === false)
        return element.removeAttribute(name);

    element.setAttribute(name, newProp as string);
}

// Checkers
const isKeyInProps = (key: string, props: HTMLAttributes): key is keyof HTMLAttributes => props.hasOwnProperty(key);

const isEvent = (name: keyof HTMLAttributes, value: HTMLAttributesValue): value is EventListener =>
    (name[0] === 'o' && name[1] === 'n') && typeof value === 'function'

const isStyleProps = (name: keyof HTMLAttributes, value: HTMLAttributesValue): value is CSSProperties => 
    name === 'style' && typeof value === 'object';

// Simplified types
type DOM = HTMLElement | SVGElement
type HTMLAttributesValue = HTMLAttributes[keyof HTMLAttributes];

const SVG_URL = 'http://www.w3.org/2000/svg';