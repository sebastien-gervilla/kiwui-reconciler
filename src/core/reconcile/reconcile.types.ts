import { Fiber } from "../../classes"

export const enum TAG {
    UPDATE = 1 << 1,
    INSERT = 1 << 2,
    REMOVE = 1 << 3,
    SVG = 1 << 4,
    DIRTY = 1 << 5,
    MOVE = 1 << 6,
    REPLACE = 1 << 7
}

export type Action = {
    op: TAG
    element?: Fiber
    before?: Fiber
}