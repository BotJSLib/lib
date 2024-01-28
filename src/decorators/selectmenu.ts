import { MetadataStorage } from "../storage/metadata.js";

export function SelectMenu(customId: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    MetadataStorage.getInstance().selectMenu.set(customId, descriptor.value);
  };
}
