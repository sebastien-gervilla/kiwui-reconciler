import { SageElement } from "sage";
import { createFiberTree } from "..";

const createRootFiber = (element: SageElement) => {
    const fiberTree = createFiberTree(element);
    if (!fiberTree) throw new Error("Application must contain elements.")
    return fiberTree;
}

export default createRootFiber;