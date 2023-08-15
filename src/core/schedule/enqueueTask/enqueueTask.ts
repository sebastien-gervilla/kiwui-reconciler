import { isFunction } from "../../../utils/is-type";

export const enqueueTask = (pending: boolean, transitions: Function[]) => {
    const task = getTask(transitions);

    // TODO: Group these conditions elsewhere - Factory ?
    if (!pending && isFunction(queueMicrotask))
        return () => queueMicrotask(task);

    if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = task;
        return () => port2.postMessage(null);
    }

    return () => setTimeout(task);
}

const getTask = (transitions: Function[]) => {
    return () => transitions
        .splice(0, 1)
        .forEach(cb => cb());
}