import { Dependencies, Hooks } from "kiwui";
import { useMemo } from "../useMemo";

export const useCallback: Hooks['useCallback'] = <T extends Function>(callback: T, dependencies: Dependencies) => {
    return useMemo(() => callback, dependencies);
}