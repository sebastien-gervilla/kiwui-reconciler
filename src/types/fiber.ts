import { FiberHostElement, FiberHostText } from "../classes"

export type FiberType =
    | 'Root'
    | 'DOMElement'
    | 'Component'
    | 'Expression'

// These can be rendereted
export type FiberHost = FiberHostElement | FiberHostText;