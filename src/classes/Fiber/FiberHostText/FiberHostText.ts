import Fiber from "../Fiber";

export default class FiberHostText extends Fiber {
    public content: string;

    constructor(content: string) {
        super('DOMElement');
        this.content = content;
    }
}