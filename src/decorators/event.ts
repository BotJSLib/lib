import { MetadataStorage } from "../storage/metadata.js";

export type EventType = "join" | "leave" | "message-edit" | "message";

export function Event(event: EventType) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const storage = MetadataStorage.getInstance();
    if (!storage.events.has(event)) {
      storage.events.set(event, []);
    }
    const events = storage.events.get(event);
    events!.push(descriptor.value);
    storage.events.set(event, events!);
  };
}
