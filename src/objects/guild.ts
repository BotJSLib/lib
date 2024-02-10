import { Bot } from "../bot.js";
import { MessageBuilder } from "./message.js";

export class Guild {
  id: string;
  bot: Bot;

  name?: string;
  iconUrl?: string;

  constructor(id: string, bot: Bot) {
    this.id = id;
    this.bot = bot;
  }

  async send(message: MessageBuilder, channelId?: string) {
    await this.bot.base.sendToChannel(channelId || this.id, message, this.id);
  }

  async mute(userId: string, time: number) {
    await this.bot.base.muteUser(userId, this.id, time);
  }

  async ban(userId: string) {
    await this.bot.base.banUser(userId, this.id, "No reason provided");
  }

  async kick(userId: string) {
    await this.bot.base.kickUser(userId, this.id, "No reason provided");
  }
  
  async getHistory(channelId?: string) {
    return await this.bot.base.getHistory(channelId || this.id, this.id);
  }

  async fetch() {
    const guild = await this.bot.base.getGuild(this.id);
    this.name = guild.name;
    this.iconUrl = guild.iconUrl;

    this.bot.cache.set(this.id, this);
    return this;
  }
}