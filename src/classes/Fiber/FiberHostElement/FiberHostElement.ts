import { Key, SageElement, SageHTML } from "sage";
import Fiber from "../Fiber";

export default class FiberHostElement extends Fiber {
    public tag: keyof SageHTML;
    public props: SageElement<keyof SageHTML>['props'];
    public oldProps: SageElement<keyof SageHTML>['props'] | null = null;

    constructor(tag: keyof SageHTML, props: SageElement<keyof SageHTML>['props']) {
        super('DOMElement');
        this.tag = tag;
        this.props = props;
    }
    
}