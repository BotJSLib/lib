import { Client } from "discord.js";
import { Listener } from "./base-listener";
import { Bot } from "../bot";

export class DiscordListener implements Listener {
  private bot: Bot;
  private base: Client;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base as Client;
  }

  registerMemberAdd(fun: Function): void {
    this.base.on("guildMemberAdd", async (member) => {
      const user = this.bot.getUser(member.id);
      fun(user);
    });
  }
  registerMemberRemove(fun: Function): void {
    this.base.on("guildMemberRemove", async (member) => {
      const user = this.bot.getUser(member.id);
      fun(user);
    });
  }
  registerMessageUpdate(fun: Function): void {
    this.base.on("messageUpdate", async (msg, newMsg) => {
      const user = this.bot.getUser(msg.author!.id);
      fun(user, msg.content, newMsg.content);
    });
  }
  registerMessageCreate(fun: Function): void {
    this.base.on("messageCreate", async (msg) => {
      const user = this.bot.getUser(msg.author.id);
      fun(user, msg.content);
    });
  }
}
