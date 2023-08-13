import Fiber from "../Fiber";
import { FunctionComponent, Key } from "sage";

export default class FiberComponent extends Fiber {
    public key?: Key | null | undefined;
    public tag: string;
    public props: Object;
    public oldProps: Object | null = null;

    public component: FunctionComponent;
    public hooks: Hooks = {
        states: [],
        layouts: [],
        effects: []
    };

    constructor(component: FunctionComponent, props: Object) {
        super('Component')
        this.tag = component.name;
        this.component = component;
        this.props = props;
    }
}

type Hooks = {
    states: any[]
    layouts: any[]
    effects: any[]
}