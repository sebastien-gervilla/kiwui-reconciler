import { Fiber } from "../../classes"

export interface Task {
    callback: () => any
    fiber?: Fiber
}