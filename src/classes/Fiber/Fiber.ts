import { HTMLAttributes, Key } from "sage";
import { FiberType } from "../../types"

export default class Fiber {
    public key?: Key | null | undefined;
    public tag: string;
    public props: HTMLAttributes | {};

    public parent: Fiber | null = null;
    public child: Fiber | null = null;
    public sibling: Fiber | null = null;

    public hooks: any[] = [];

    constructor(public type: FiberType, tag: string, props: HTMLAttributes | {}) {
        this.tag = tag;
        this.props = props;
    }
}