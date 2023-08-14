import { Task } from "./schedule.types"

// TODO: Relocate this in another package ?

const queue: Task[] = []
const threshold: number = 4
const transitions: any[] = []
let deadline: number = 0

export const schedule = (callback: () => any) => {
    queue.push({ callback });
    startTransition(flush);
}

const startTransition = (cb: any) =>
    transitions.push(cb) && translate();

const enqueueTask = (pending: boolean) => {
    const callback = () => transitions.splice(0, 1).forEach(c => c())

    // TODO: Group these conditions elsewhere - Factory ?
    if (!pending && typeof queueMicrotask !== 'undefined')
        return () => queueMicrotask(callback);

    if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = callback;
        return () => port2.postMessage(null);
    }

    return () => setTimeout(callback);
}

let translate = enqueueTask(false);

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

    translate = enqueueTask(shouldYield());
    startTransition(flush);
}

export const shouldYield = () => getTime() >= deadline;

export const getTime = () => performance.now();

const peek = (): Task | undefined => queue[0]