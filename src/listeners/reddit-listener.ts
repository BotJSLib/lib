import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { Message } from "../objects/message.js";

export class RedditListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: (user: User, guild: Guild, bot: Bot) => void): void {}

  registerMemberRemove(fun: (user: User, guild: Guild, bot: Bot) => void): void {}

  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message, bot: Bot) => void
  ): void {}

  registerMessageCreate(fun: (user: User, message: Message, bot: Bot) => void): void {
    this.base.subscribe(
      "message",
      async (author: User, message: string, guild: Guild, channel: string) => {
        fun(author, new Message(message, guild, message, channel), this.bot);
      }
    );
  }
}
