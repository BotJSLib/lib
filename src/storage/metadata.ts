import { RegisteredCommand } from "../objects/command.js";

export default class MetadataStorage {
  static instance: MetadataStorage;

  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  commands: Map<string, RegisteredCommand> = new Map<string, RegisteredCommand>();
  events: Map<string, Function[]> = new Map<string, Function[]>();
}