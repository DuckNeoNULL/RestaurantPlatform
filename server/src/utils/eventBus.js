import EventEmitter from "events";
export const eventBus = new EventEmitter();

export const emitEvent = (event, payload) => eventBus.emit(event, payload);
