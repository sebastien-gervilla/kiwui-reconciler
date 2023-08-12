import { SageElementChildren } from "sage";
import { FiberType } from "../../types"
import { TAG } from "../../core";

export default class Fiber {
    public parent: Fiber | null = null;
    public child: Fiber | null = null;
    public sibling: Fiber | null = null;

    public node!: HTMLElementEx;
    public parentNode!: HTMLElementEx;
    public wipNode: SageElementChildren[] = [];
    public kids: Fiber[] = [];
    public old: Fiber | null = null;

    public action: Action | null = null;

    public children: Fiber[] = [];
    public isDirty: boolean = false;
    public lane!: number; // TODO: Can it be null ?

    public isGettingNode: boolean = false;

    constructor(public type: FiberType) {}
}

export type Action = {
    op: TAG
    element?: Fiber
    before?: Fiber
}

export type HTMLElementEx = HTMLElement & { last: Fiber | null }