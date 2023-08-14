import { TAG } from '../reconcile'
import { FiberHostElement, FiberHostText } from '../../classes'
import { CSSStyleKey, HTMLAttributes } from 'sage'
import { isFiberText } from '../../utils/is-type'

// TODO: Relocation to sage-dom-bindings ?

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

const applyStyles = (element: DOM, oldStyles: CSSProps, newStyles: CSSProps) => {
    for (const styleKey in newStyles) {
        if (newStyles[styleKey] !== oldStyles[styleKey])
            element.style[styleKey] = newStyles[styleKey].toString();
    }

    // Reset old properties
    for (const styleKey in oldStyles)
        if (!(styleKey in newStyles))
            element.style[styleKey] = ''
};

const updateElementProps = (dom: DOM, name: keyof HTMLAttributes, oldProp: HTMLAttributesValue, newProp: HTMLAttributesValue) => {
    if (oldProp === newProp || name === 'children')
        return;

    if (isStyleProps(name, newProp))
        return applyStyles(dom, newProp, oldProp as CSSProps);

    if (isEvent(name, newProp)) {
        // TODO: Support more listeners
        const type = name.slice(2).toLowerCase();
        if (oldProp) dom.removeEventListener(type, oldProp as DOMEvent);
        return dom.addEventListener(type, newProp);
    }
    
    if (name in dom && !(dom instanceof SVGElement)) {
        // @ts-ignore - This ignores "style" readonly error
        dom[name] = newProp || '';
        return;
    }
    
    if (newProp === null || newProp === false)
        return dom.removeAttribute(name);

    dom.setAttribute(name, newProp as string);
}

// Checkers
const isKeyInProps = (key: string, props: HTMLAttributes): key is keyof HTMLAttributes => props.hasOwnProperty(key);

const isEvent = (name: keyof HTMLAttributes, value: HTMLAttributesValue): value is DOMEvent =>
    (name[0] === 'o' && name[1] === 'n') && typeof value === 'function'

const isStyleProps = (name: keyof HTMLAttributes, value: HTMLAttributesValue): value is CSSProps => 
    name === 'style' && typeof value === 'object';

// Simplified types
type DOM = HTMLElement | SVGElement
type HTMLAttributesValue = HTMLAttributes[keyof HTMLAttributes];
type CSSProps = Record<CSSStyleKey, string | number>;
type DOMEvent = EventListenerOrEventListenerObject;

const SVG_URL = 'http://www.w3.org/2000/svg';