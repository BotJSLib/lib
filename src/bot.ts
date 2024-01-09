import { Client } from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import { User } from "./objects/user";

export class Bot {
  token: string;
  platform: Platform;
  base: Client | TelegramBot;
  commands: Map<string, Function> = new Map();

  constructor(token: string, platform: Platform) {
    this.token = token;
    this.platform = platform;

    if (this.platform === Platform.Discord) {
      this.base = new Client({ intents: [] });
    } else {
      this.base = new TelegramBot(token, { polling: true });
    }
  }

  async start() {
    if (this.base instanceof Client) {
      await this.base.login(this.token);
    }
  }

  getUser(id: string) {
    return new User(id, this);
  }

  registerCommand(
    command: string,
    callback: (user: User, args: string[]) => void
  ) {
    this.commands.set(command, callback);

    if (this.base instanceof TelegramBot) {
      const regex = new RegExp(`^\/${command}$`);
      this.base.onText(regex, async (msg, match) => {
        const user = this.getUser(msg.chat.id.toString());
        const args = match?.slice(1) ?? [];
        callback(user, args);
      });
    }
  }

  onMessage(callback: (user: User, message: string) => void) {
    if (this.base instanceof Client) {
      this.base.on("message", async (msg) => {
        const user = this.getUser(msg.author.id);
        callback(user, msg.content);
      });
    } else {
      this.base.on("message", async (msg) => {
        const user = this.getUser(msg.chat.id.toString());
        callback(user, msg.text || "");
      });
    }
  }

  onButton(callback: (user: User, data: string) => void) {
    if (this.base instanceof TelegramBot) {
      this.base.on("callback_query", async (query) => {
        const user = this.getUser(query.message!.chat.id.toString());
        callback(user, query.data!);
      });
    } else {
      this.base.on("interactionCreate", async (interaction) => {
        if (interaction.isButton()) {
          const user = this.getUser(interaction.user.id);
          callback(user, interaction.customId);
        }
      });
    }
  }
}

export enum Platform {
  Discord = "discord",
  Telegram = "telegram",
}