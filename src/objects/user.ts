import { Client } from "discord.js";
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
    if (this.bot.base instanceof Client) {
      const user = await this.bot.base.users.fetch(this.id);
      await user.send(message.toDiscord());
    } else {
      await this.bot.base.sendMessage(
        this.id,
        message.content,
        message.toTelegram()
      );
    }
  }

  async fetch() {
    if (this.bot.base instanceof Client) {
      const user = await this.bot.base.users.fetch(this.id);
      this.username = user.username;
      this.avatarUrl = user.displayAvatarURL();
    } else {
      const user = await this.bot.base.getChat(this.id);
      this.username = user.username;
      this.avatarUrl = user.photo?.big_file_id;
    }

    this.bot.cache.set(this.id, this);
  }
}
