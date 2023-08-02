import Fiber from "../Fiber";
import { FunctionComponent, Key } from "sage";

export default class FiberComponent extends Fiber {
    public key?: Key | null | undefined;
    public tag: string;
    public props: Object;

    public component: FunctionComponent;
    public hooks: any[] = [];

    constructor(component: FunctionComponent, props: Object) {
        super('Component')
        this.tag = component.name;
        this.component = component;
        this.props = props;
    }
}