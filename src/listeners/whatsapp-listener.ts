import { Bot } from "../bot.js";
import { Guild } from "../objects/guild.js";
import { Message } from "../objects/message.js";
import { User } from "../objects/user.js";
import { Base } from "../wrapper/base.js";
import { Listener } from "./base-listener.js";

export class WhatsappListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: (user: User, guild: Guild) => void): void {}

  registerMemberRemove(fun: (user: User, guild: Guild) => void): void {}

  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message) => void
  ): void {
    this.base.subscribe("message_update", fun);
  }

  registerMessageCreate(fun: (user: User, message: Message) => void): void {
    this.base.subscribe("message", fun);
  }
}
