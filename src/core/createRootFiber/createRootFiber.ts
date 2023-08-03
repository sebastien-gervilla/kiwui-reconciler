import { SageElement } from "sage";
import { createFiberTree } from "..";
import { Fiber } from "../../classes";

const createRootFiber = (element: SageElement, updateContainer: (rootFiber: Fiber) => void) => {
    const fiberTree = createFiberTree(element, updateContainer);
    if (!fiberTree) throw new Error("Application must contain elements.")
    return fiberTree;
}

export default createRootFiber;