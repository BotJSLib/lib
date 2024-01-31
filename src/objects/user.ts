import { Bot } from "../bot.js";
import { MessageBuilder } from "./message.js";

export class User {
  id: string;
  bot: Bot;

  username?: string;
  avatarUrl?: string;

  constructor(id: string, bot: Bot) {
    this.id = id;
    this.bot = bot;
  }

  async send(message: MessageBuilder) {
    await this.bot.base.sendToUser(this.id, message);
  }

  async fetch() {
    const user = await this.bot.base.getUser(this.id);
    this.username = user.username;
    this.avatarUrl = user.avatarUrl;

    this.bot.cache.set(this.id, this);
    return this;
  }
}
