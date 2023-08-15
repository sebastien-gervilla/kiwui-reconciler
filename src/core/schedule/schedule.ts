import { enqueueTask } from "./enqueueTask"
import { Task } from "./schedule.types"

// TODO: Relocate this in another package ?

const queue: Task[] = []
const threshold: number = 4
const transitions: Function[] = []
let deadline: number = 0

export const schedule = (callback: () => any) => {
    queue.push({ callback });
    startTransition(flush);
}

const startTransition = (cb: Function) =>
    transitions.push(cb) && translate();

let translate = enqueueTask(false, transitions);

const flush = () => {
    deadline = getTime() + threshold
    
    let task = peek();
    while (task && !shouldYield()) {
        const { callback } = task;
        const next = callback();

        if (next)
            task.callback = next;
        else
            queue.shift();

        task = peek();
    }

    if (!task) return;

    translate = enqueueTask(shouldYield(), transitions);
    startTransition(flush);
}

export const shouldYield = () => getTime() >= deadline;

const getTime = () => performance.now();

const peek = (): Task | undefined => queue[0]