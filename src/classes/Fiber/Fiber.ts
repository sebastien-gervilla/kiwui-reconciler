import { KiwuiElementChildren } from "kiwui";
import { FiberType } from "../../types"
import { Action } from "../../core/reconcile/reconcile.types";

export default class Fiber {
    public parent: Fiber | null = null;
    public child: Fiber | null = null;
    public sibling: Fiber | null = null;

    public node!: HTMLElement;
    public parentNode!: HTMLElement;
    public wipNode: KiwuiElementChildren[] = [];
    public kids: Fiber[] = [];

    public action: Action | null = null;

    public children: Fiber[] = [];
    public isDirty: boolean = false;
    public lane!: number; // TODO: Can it be null ?

    public isGettingNode: boolean = false;

    constructor(public type: FiberType) {}
}