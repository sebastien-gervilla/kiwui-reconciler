import { KiwuiNode, SingleKiwuiNode } from "kiwui";

export const flattenNode = (array: KiwuiNode[], flattened: SingleKiwuiNode[] = [], depth = 0): SingleKiwuiNode[] => {
    depth++;
    if (depth > 3) console.warn(
        "Deeply nested node found, which can cause performance issues."
    );

    for (let i = 0; i < array.length; i++) {
        const value = array[i];

        if (canFlatten(value)) {
            flattenNode(value, flattened, depth);
            continue;
        }

        flattened[flattened.length] = value;
    }

    return flattened;
}

const canFlatten = Array.isArray;