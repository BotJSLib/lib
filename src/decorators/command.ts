import { Command as RegisteredCommand, Argument } from "../objects/command";
import MetadataStorage from "../storage/metadata";

export function Command(
  name: string,
  description: string,
  args: Argument[] = []
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    MetadataStorage.getInstance().commands.set(
      name,
      new RegisteredCommand(name, description, descriptor.value, args)
    );
  };
}
