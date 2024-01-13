import { Hooks } from "kiwui"
import { useMemo } from "../useMemo"

export const useRef: Hooks['useRef'] = <T>(current: T) => {
    return useMemo(() => ({ current }), [])
}