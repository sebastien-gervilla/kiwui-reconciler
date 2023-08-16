import Fiber from "../Fiber";
import { FunctionComponent, SageElement } from "sage";

export default class FiberComponent extends Fiber {
    public tag: string;
    public props: SageElement<FunctionComponent>['props'];
    public oldProps: SageElement<FunctionComponent>['props'] | null = null;

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