import { EventType } from "../decorators/event.js";
import { RegisteredCommand } from "../objects/command.js";

export class MetadataStorage {
  static instance: MetadataStorage;

  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  commands: Map<string, RegisteredCommand> = new Map<
    string,
    RegisteredCommand
  >();
  buttons: Map<string, Function> = new Map<string, Function>();
  selectMenu: Map<string, Function> = new Map<string, Function>();
  events: Map<EventType, Function[]> = new Map<EventType, Function[]>();
}
