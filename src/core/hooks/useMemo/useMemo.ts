import { Dependencies } from "kiwui";
import { getHook, hasDepsChanged, incrementCursor } from "../hooks";
import { StoredMemo } from "../hooks.types";

export const useMemo = <T>(getter: () => T, dependencies: Dependencies): T => {
    const [hook] = getHook<StoredMemo>(incrementCursor());

    if (!hasDepsChanged(hook[1], dependencies))
        return hook[0];

    hook[1] = dependencies;
    return (hook[0] = getter());
}