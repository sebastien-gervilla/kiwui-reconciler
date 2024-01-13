import { EmptyHook, StoredEffect, StoredHook } from "../../../core/hooks/hooks.types";
import Fiber from "../Fiber";
import { ExoticComponent, FunctionComponent, KiwuiElement } from "kiwui";

export default class FiberComponent<
    T extends FunctionComponent<any> | ExoticComponent<any> = FunctionComponent<any>
> extends Fiber {
    public tag: string;
    public props: KiwuiElement<T>['props'];
    public oldProps: KiwuiElement<T>['props'] | null = null;

    public component: KiwuiElement<T>['type'];
    public hooks: (StoredHook | EmptyHook)[] = [];
    public effects: StoredEffect[] = [];
    public layouts: StoredEffect[] = [];

    constructor(component: KiwuiElement<T>['type'], props: KiwuiElement<T>['props']) {
        super('Component')
        this.tag = component.name;
        this.component = component;
        this.props = props;
    }
}