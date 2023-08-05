import { HTMLAttributes } from "sage";
import { Fiber } from "../../classes"
import { FiberType } from "../../types"

/** @deprecated since fibers classes */
const createFiber = (type: FiberType, tag: string | null, props: HTMLAttributes | {} | null | undefined) => {
    return new Fiber(type);
}

export default createFiber;