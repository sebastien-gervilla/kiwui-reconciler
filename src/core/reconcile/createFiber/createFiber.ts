import { SingleKiwuiNode } from "kiwui";
import { isComponent, isKiwuiElement } from "../../../utils/is-type";
import { isValidText } from "../../../utils/validations";
import { FiberComponent, FiberHostElement, FiberHostText } from "../../../classes";

export const createFiber = (node: SingleKiwuiNode) => {
    if (isKiwuiElement(node))
        return isComponent(node) 
            ? new FiberComponent(node.type, node.props)
            : new FiberHostElement(node.type, node.props);
    
    return isValidText(node)
        ? new FiberHostText(`${node}`)
        : null;
}