import { Reference } from "kiwui"
import { useMemo } from "../useMemo"

export const useRef = <T>(current: T): Reference<T> => {
    return useMemo(() => ({ current }), [])
}