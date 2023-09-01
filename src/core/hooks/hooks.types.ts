import { Setter, StateGetter } from "kiwui";

export type StoredHook<T = any> = StoredState<T>;

export type EmptyHook = any[];

export type StoredState<T = any> = [T, Setter<StateGetter<T>>];