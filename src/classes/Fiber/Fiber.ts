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
    public wipNode: SingleKiwuiNode[] = [];
    public kids: Fiber[] = [];

    public action: Action | null = null;

    public children: Fiber[] = [];
    public isDirty: boolean = false;
    public lane!: number; // TODO: Can it be null ?

    public isGettingNode: boolean = false;

    constructor(public type: FiberType) {}
}