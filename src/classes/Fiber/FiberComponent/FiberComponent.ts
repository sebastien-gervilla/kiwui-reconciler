import { EmptyHook, StoredHook } from "../../../core/hooks/hooks.types";
import Fiber from "../Fiber";
import { FunctionComponent, KiwuiElement } from "kiwui";

export default class FiberComponent extends Fiber {
    public tag: string;
    public props: KiwuiElement<FunctionComponent>['props'];
    public oldProps: KiwuiElement<FunctionComponent>['props'] | null = null;

    public component: FunctionComponent;
    public hooks: (StoredHook | EmptyHook)[] = [];

    constructor(component: FunctionComponent, props: Object) {
        super('Component')
        this.tag = component.name;
        this.component = component;
        this.props = props;
    }
}