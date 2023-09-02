import { Dependencies, Effect } from "kiwui"
import { getHook, hasDepsChanged, incrementCursor } from "../hooks"
import { StoredEffect } from "../hooks.types"

export const useEffect = (effect: Effect, dependencies?: Dependencies): void => {
    return effectImplementation(effect, dependencies!, "effects")
}
  
export const useLayoutEffect = (effect: Effect, dependencies?: Dependencies): void => {
    return effectImplementation(effect, dependencies!, "layouts")
}
  
const effectImplementation = (
    effect: Effect,
    dependencies: Dependencies,
    key: 'effects' | 'layouts'
): void => {
    const [hook, current] = getHook<StoredEffect>(incrementCursor());

    if (!hasDepsChanged(hook[1], dependencies))
        return;

    hook[0] = effect;
    hook[1] = dependencies;
    current[key].push(hook as StoredEffect);
}