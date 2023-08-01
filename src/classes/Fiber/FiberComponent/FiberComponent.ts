import Fiber from "../Fiber";
import { Key } from "sage";

export default class FiberComponent extends Fiber {
    public key?: Key | null | undefined;
    public tag: string;
    public props: Object;

    public hooks: any[] = [];

    constructor(tag: string, props: Object) {
        super('Component')
        this.tag = tag;
        this.props = props;
    }
}