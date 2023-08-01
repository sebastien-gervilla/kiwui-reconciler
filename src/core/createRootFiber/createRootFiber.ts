import { SageElement } from "sage";
import { createFiberTree } from "..";

const createRootFiber = (element: SageElement, updateContainer: () => void) => {
    console.log(updateContainer);
    
    const fiberTree = createFiberTree(element, updateContainer);
    if (!fiberTree) throw new Error("Application must contain elements.")
    return fiberTree;
}

export default createRootFiber;