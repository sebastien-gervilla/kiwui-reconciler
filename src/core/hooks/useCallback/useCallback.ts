import { Dependencies } from "kiwui";
import { useMemo } from "../useMemo";

export const useCallback = <T extends Function>(callback: T, dependencies: Dependencies) => {
    return useMemo(() => callback, dependencies);
}