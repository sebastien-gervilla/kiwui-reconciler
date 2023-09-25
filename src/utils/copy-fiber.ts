import { Fiber } from "../classes";

// NOTE: We assign the new fiber to the old one, thus keeping old and new tree synchronized.
// With this, multiple state changes on the same component references always the same fiber.
export const copyFiber = (oldFiber: Fiber, newFiber: Fiber) => {
    // "as any" because we don't care if they don't have props
    const oldProps = (oldFiber as any).props;

    const { kids, node } = oldFiber;
    oldFiber = newFiber;
    oldFiber.kids = kids;
    oldFiber.node = node;

    (oldFiber as any).oldProps = oldProps;
}