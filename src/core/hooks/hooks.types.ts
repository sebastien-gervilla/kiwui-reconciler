import { Cleanup, Dependencies, Effect, Setter, StateGetter } from "kiwui";

export type StoredHook<T = any> = StoredState<T> | StoredEffect | StoredMemo<T>;

export type EmptyHook = any[];

export type StoredState<T = any> = [T, Setter<StateGetter<T>>];

export type StoredEffect = [Effect, Dependencies, Cleanup?];

export type StoredMemo<T = any> = [T, Dependencies];