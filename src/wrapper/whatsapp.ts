import { Bot } from "../bot.js";
import twilio from "twilio";
import { Base } from "./base.js";
import { Guild } from "../objects/guild.js";
import { Message, MessageBuilder } from "../objects/message.js";
import { User } from "../objects/user.js";
import express from "express";
import { MetadataStorage } from "../storage/metadata.js";

export class WhatsappBase implements Base {
  token: string;
  client: twilio.Twilio;
  server: express.Express;
  bot: Bot;
  port: number;
  number: string;
  listeners: ((user: User, message: Message) => void)[] = [];

  constructor(bot: Bot, token: string, options?: any) {
    this.token = token;
    this.bot = bot;
    this.client = twilio(options.sid, token);
    this.server = express();
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    this.port = options.port;
    this.number = options.number;
    this.server.post("/", async (req, res) => {
      const message = req.body.Body;
      const user = this.bot.getUser(req.body.From);
      this.listeners.forEach((listener) => {
        listener(user, new Message(message, null, message));
      });
    });
  }

  async start(): Promise<void> {
    this.server.listen(this.port);
  }

  subscribe(
    event: string,
    callback: (
      user: User,
      oldContent: string | Message,
      message?: Message,
      bot?: Bot
    ) => void
  ): void {
    if (event === "message") {
      this.listeners.push(callback);
    } else if (event === "message_update") {
      this.listeners.push((user: User, message: Message) => {
        if (message.content.length === 0) {
          callback(user, message.content, message, this.bot);
        }
      });
    }
  }

  removeListeners(): void {
    this.listeners = [];
  }

  async registerCommands(): Promise<void> {
    for (const command of MetadataStorage.getInstance().commands) {
      this.listeners.push((user: User, message: Message) => {
        if (message.content.startsWith(command[0])) {
          const args = new Map<string, string>();
          const split = message.content.split(" ");
          split.shift();
          for (let i = 0; i < split.length; i++) {
            args.set(command[1].args[i]!.name, split[i]!);
          }
          const response: MessageBuilder = command[1].callback(user, args);
          if (response) user.send(response);
        }
      });
    }

    for (const button of MetadataStorage.getInstance().buttons) {
      this.listeners.push((user: User, message: Message) => {
        if (message.content.startsWith(button[0])) {
          const response: MessageBuilder = button[1](user);
          if (response) user.send(response);
        }
      });
    }
  }

  getGuild(id: string): Promise<Guild> {
    throw new Error("This action is not supported in Whatsapp.");
  }

  getUser(id: string): Promise<User> {
    const user = new User(id, this.bot);
    user.username = "Whatsapp User";
    return Promise.resolve(user);
  }

  banUser(id: string, guild: string, reason: string): Promise<void> {
    throw new Error("This action is not supported in Whatsapp.");
  }

  kickUser(id: string, guild: string, reason: string): Promise<void> {
    throw new Error("This action is not supported in Whatsapp.");
  }

  muteUser(id: string, guild: string, time: number): Promise<void> {
    throw new Error("This action is not supported in Whatsapp.");
  }

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    await this.client.messages.create({
      from: `whatsapp:${this.number}`,
      body: message.content,
      to: id,
    });
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string | undefined
  ): Promise<void> {
    await this.client.messages.create({
      from: `whatsapp:${this.number}`,
      body: message.content,
      to: id,
    });
  }
}
