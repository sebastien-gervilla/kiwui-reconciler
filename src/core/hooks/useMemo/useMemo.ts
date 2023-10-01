import { Dependencies, Hooks } from "kiwui";
import { getHook, hasDepsChanged, incrementCursor } from "../hooks";
import { StoredMemo } from "../hooks.types";

export const useMemo: Hooks['useMemo'] = <T>(getter: () => T, dependencies: Dependencies) => {
    const [hook] = getHook<StoredMemo>(incrementCursor());

    if (!hasDepsChanged(hook[1], dependencies))
        return hook[0];

    hook[1] = dependencies;
    return (hook[0] = getter());
}