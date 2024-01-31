import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { MessageBuilder } from "../objects/message.js";

export interface Base {
  start(): Promise<void>;
  subscribe(event: string, callback: Function): void;
  removeListeners(): void;
  registerCommands(): Promise<void>;
  getGuild(id: string): Promise<Guild>;
  getUser(id: string): Promise<User>;
  banUser(id: string, guild: string, reason: string): Promise<void>;
  kickUser(id: string, guild: string, reason: string): Promise<void>;
  muteUser(id: string, guild: string, time: number): Promise<void>;
  sendToUser(id: string, message: MessageBuilder): Promise<void>;
  sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string
  ): Promise<void>;
}
