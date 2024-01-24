import { Client, TextChannel } from "discord.js";
import { Bot } from "../bot";

export class Guild {
  id: string;
  bot: Bot;

  name?: string;
  iconUrl?: string;

  constructor(id: string, bot: Bot) {
    this.id = id;
    this.bot = bot;
  }

  async send(message: string, channelId?: string) {
    if (this.bot.base instanceof Client) {
      if (!channelId)
        throw new Error("Channel ID is required when using a client.");

      const guild = await this.bot.base.guilds.fetch(this.id);
      const channel = (await guild.channels.fetch(channelId)) as TextChannel;
      await channel.send(message);
    } else {
      await this.bot.base.sendMessage(this.id, message);
    }
  }

  async mute(userId: string, time: number) {
    if (this.bot.base instanceof Client) {
      const guild = await this.bot.base.guilds.fetch(this.id);
      const member = await guild.members.fetch(userId);
      member.timeout(time / 1000);
    } else {
      await this.bot.base.restrictChatMember(this.id, Number(userId), {
        until_date: Math.floor(Date.now() / 1000) + time,
      });
    }
  }

  async ban(userId: string) {
    if (this.bot.base instanceof Client) {
      const guild = await this.bot.base.guilds.fetch(this.id);
      const member = await guild.members.fetch(userId);
      member.ban();
    } else {
      await this.bot.base.banChatMember(this.id, Number(userId));
    }
  }

  async kick(userId: string) {
    if (this.bot.base instanceof Client) {
      const guild = await this.bot.base.guilds.fetch(this.id);
      const member = await guild.members.fetch(userId);
      member.kick();
    } else {
      await this.bot.base.banChatMember(this.id, Number(userId), {
        until_date: Math.floor(Date.now() / 1000) + 1,
      });
    }
  }

  async fetch() {
    if (this.bot.base instanceof Client) {
      const guild = await this.bot.base.guilds.fetch(this.id);
      this.name = guild.name;
      this.iconUrl = guild.iconURL() || undefined;
    } else {
      const user = await this.bot.base.getChat(this.id);
      this.name = user.first_name;
      this.iconUrl = user.photo?.big_file_id;
    }

    this.bot.cache.set(this.id, this);
  }
}
