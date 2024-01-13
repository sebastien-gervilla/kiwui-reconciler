import { SingleKiwuiNode } from "kiwui";
import { FiberType } from "../../types"
import { Action } from "../../core/reconcile/reconcile.types";
import { FiberComponent } from "./FiberComponent";
import { FiberHostElement } from "./FiberHostElement";

export default class Fiber {
    public parent: FiberComponent | FiberHostElement | null = null;
    public child: Fiber | null = null;
    public sibling: Fiber | null = null;

    // Makes reconciliation easier
    public node: any;

    public parentNode!: HTMLElement;
    public kids: Fiber[] = [];

    public action: Action | null = null;

    public isDirty: boolean = false;
    public lane!: number;

    public isGettingNode: boolean = false;

    constructor(public type: FiberType) {}
}