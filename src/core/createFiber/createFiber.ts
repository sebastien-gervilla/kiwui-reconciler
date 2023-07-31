import { HTMLAttributes } from "sage";
import { Fiber } from "../../classes"
import { FiberType } from "../../types"

const createFiber = (type: FiberType, tag: string, props: HTMLAttributes | {} | null | undefined) => {
    return new Fiber(type, tag, props || {});
}

export default createFiber;