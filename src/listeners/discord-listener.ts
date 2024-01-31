import { GuildMember, Message } from "discord.js";
import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";

export class DiscordListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: Function): void {
    this.base.subscribe("guildMemberAdd", async (member: GuildMember) => {
      const user = this.bot.getUser(member.id);
      fun(user);
    });
  }

  registerMemberRemove(fun: Function): void {
    this.base.subscribe("guildMemberRemove", async (member: GuildMember) => {
      const user = this.bot.getUser(member.id);
      fun(user);
    });
  }

  registerMessageUpdate(fun: Function): void {
    this.base.subscribe(
      "messageUpdate",
      async (msg: Message, newMsg: Message) => {
        const user = this.bot.getUser(msg.author!.id);
        fun(user, msg.content, newMsg.content);
      }
    );
  }
  
  registerMessageCreate(fun: Function): void {
    this.base.subscribe("messageCreate", async (msg: Message) => {
      const user = this.bot.getUser(msg.author.id);
      fun(user, msg.content);
    });
  }
}
