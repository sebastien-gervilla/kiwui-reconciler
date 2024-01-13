import { FunctionComponent, KiwuiElement, SingleKiwuiNode, KiwuiHTML, MemoComponent, PortalComponent } from "kiwui";
import { Fiber, FiberComponent, FiberHostElement, FiberHostText } from "../classes";
import { isValidTag } from "./validations";
import { EmptyHook, StoredHook } from "../core/hooks/hooks.types";

export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';

export const isComponent = (value: KiwuiElement): value is KiwuiElement<FunctionComponent> => typeof value.type === 'function';

export const isHTMLElement = (element: KiwuiElement): element is KiwuiElement<keyof KiwuiHTML> => 
    typeof element === 'object' && isValidTag(element.type);

export const isKiwuiElement = (value: SingleKiwuiNode): value is KiwuiElement => 
    !!value && typeof value === 'object';

// Fiber

export const isFiberComponent = (value: Fiber): value is FiberComponent => value instanceof FiberComponent;
export const isFiberElement = (value: Fiber): value is FiberHostElement => value instanceof FiberHostElement;
export const isFiberText = (value: Fiber): value is FiberHostText => value instanceof FiberHostText;
export const isFiberHost = (value: Fiber): value is (FiberHostText | FiberHostElement) =>
    value instanceof FiberHostElement || value instanceof FiberHostText;

// TODO: FiberExotic map
export const isFiberMemo = (fiber: FiberComponent<any>): 
    fiber is FiberComponent<MemoComponent> => 
        fiber.component.exoticTag === 'Memo';

export const isFiberPortal = (fiber: FiberComponent<any>): 
    fiber is FiberComponent<PortalComponent> => 
        fiber.component.exoticTag === 'Portal';

// Hook

export const isEmptyHook = (hook: StoredHook | EmptyHook): hook is EmptyHook => hook.length === 0