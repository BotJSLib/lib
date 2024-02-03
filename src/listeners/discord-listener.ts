import { GuildMember, Message } from "discord.js";
import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { Message as MessageObject } from "../objects/message.js";

export class DiscordListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: (user: User, guild: Guild) => void): void {
    this.base.subscribe("guildMemberAdd", async (member: GuildMember) => {
      const user = this.bot.getUser(member.id);
      const guild = this.bot.getGuild(member.guild.id);
      fun(user, guild);
    });
  }

  registerMemberRemove(fun: (user: User, guild: Guild) => void): void {
    this.base.subscribe("guildMemberRemove", async (member: GuildMember) => {
      const user = this.bot.getUser(member.id);
      const guild = this.bot.getGuild(member.guild.id);
      fun(user, guild);
    });
  }

  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: MessageObject) => void
  ): void {
    this.base.subscribe(
      "messageUpdate",
      async (msg: Message, newMsg: Message) => {
        const user = this.bot.getUser(msg.author!.id);
        const guild = msg.guild ? this.bot.getGuild(msg.guild!.id) : null;
        fun(
          user,
          msg.content,
          new MessageObject(newMsg.id, guild, newMsg.content, newMsg.channelId)
        );
      }
    );
  }

  registerMessageCreate(
    fun: (user: User, message: MessageObject) => void
  ): void {
    this.base.subscribe("messageCreate", async (msg: Message) => {
      const user = this.bot.getUser(msg.author.id);
      const guild = msg.guild ? this.bot.getGuild(msg.guild!.id) : null;
      fun(user, new MessageObject(msg.id, guild, msg.content, msg.channelId));
    });
  }
}
