import { KiwuiElement, KiwuiHTML } from "kiwui";
import Fiber from "../Fiber";

export default class FiberHostElement extends Fiber {
    public tag: keyof KiwuiHTML;
    public node!: HTMLElement;
    public props: KiwuiElement<keyof KiwuiHTML>['props'];
    public oldProps: KiwuiElement<keyof KiwuiHTML>['props'] | null = null;

    constructor(tag: keyof KiwuiHTML, props: KiwuiElement<keyof KiwuiHTML>['props']) {
        super('DOMElement');
        this.tag = tag;
        this.props = props;
    }
    
}