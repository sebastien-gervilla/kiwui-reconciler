import { FiberType } from "../../types"

export default class Fiber {
    public parent: Fiber | null = null;
    public child: Fiber | null = null;
    public sibling: Fiber | null = null;

    constructor(public type: FiberType) {}
}