import { Command } from "../objects/command";

export default class MetadataStorage {
    static instance: MetadataStorage;

    static getInstance(): MetadataStorage {
        if (!MetadataStorage.instance) {
            MetadataStorage.instance = new MetadataStorage();
        }
        return MetadataStorage.instance;
    }

    commands: Map<string, Command> = new Map<string, Command>();

}