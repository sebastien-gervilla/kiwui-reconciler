import { HTMLAttributes, Key, SageHTML } from "sage";
import Fiber from "../Fiber";

export default class FiberHostElement extends Fiber {
    public key?: Key | null | undefined;
    public tag: keyof SageHTML;
    public props: HTMLAttributes;

    constructor(tag: keyof SageHTML, props: HTMLAttributes) {
        super('DOMElement');
        this.tag = tag;
        this.props = props;
    }
    
}