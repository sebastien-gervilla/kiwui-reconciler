import { Setter, StateGetter } from "sage";

export type StoredHook<T = any> = StoredState<T>;

export type EmptyHook = any[];

export type StoredState<T = any> = [T, Setter<StateGetter<T>>];