import { Bot } from "../bot.js";
import { Guild } from "../objects/guild.js";
import { Message, MessageBuilder } from "../objects/message.js";
import { User } from "../objects/user.js";
import { MetadataStorage } from "../storage/metadata.js";
import { Base } from "./base.js";
import { Chat, ChatEvents } from "twitch-js";

export class TwitchBase implements Base {
  token: string;
  client: Chat;
  bot: Bot;
  channels: string[] = [];

  constructor(bot: Bot, token: string, options?: any) {
    this.token = token;
    this.bot = bot;
    this.client = new Chat({
      username: options?.username,
      token: token,
      log: {
        enabled: false,
      },
    });
    this.channels = options?.channels;
  }

  async start(): Promise<void> {
    await this.client.connect();
    for (const channel of this.channels) {
      await this.client.join(channel);
    }
  }

  subscribe(event: string, callback: Function): void {
    this.client.on(event, callback as any);
  }

  removeListeners(): void {
    this.client.removeAllListeners();
  }

  async registerCommands(): Promise<void> {
    this.client.on(ChatEvents.ALL, async (message) => {
      if (!("message" in message) || !message.message) return;

      const split = message.message.split(" ");
      const command = MetadataStorage.getInstance().commands.get(
        split[0]!.toLowerCase()
      );
      if (!command) return;
      const user = this.bot.getUser(message.username);
      const args = new Map<string, string>();
      split.shift();
      for (let i = 0; i < split.length; i++) {
        args.set(command.args[i]!.name, split[i]!);
      }
      const response = await command.callback(user, args);
      this.client.say(message.channel, response.content);
    });
  }

  async getGuild(id: string): Promise<Guild> {
    return new Guild(id, this.bot);
  }

  async getUser(id: string): Promise<User> {
    return new User(id, this.bot);
  }

  async banUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.ban(guild, id);
  }

  kickUser(id: string, guild: string, reason: string): Promise<void> {
    throw new Error("Kick is not available on twitch.");
  }
  async muteUser(id: string, guild: string, time: number): Promise<void> {
    await this.client.timeout(guild, id, time);
  }

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    await this.client.whisper(id, message.content);
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string | undefined
  ): Promise<void> {
    await this.client.say(id, message.content);
  }

  async getHistory(
    channel: string,
    guild?: string | undefined
  ): Promise<Message[]> {
    return [];
  }
}
