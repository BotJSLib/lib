import { MetadataStorage } from "../storage/metadata.js";

export function Button(customId: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    MetadataStorage.getInstance().buttons.set(customId, descriptor.value);
  };
}
