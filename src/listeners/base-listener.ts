import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { Message } from "../objects/message.js";
import { Bot } from "../bot.js";

export interface Listener {
  registerMemberAdd(fun: (user: User, guild: Guild, bot: Bot) => void): void;
  registerMemberRemove(fun: (user: User, guild: Guild, bot: Bot) => void): void;
  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message, bot: Bot) => void
  ): void;
  registerMessageCreate(
    fun: (user: User, message: Message, bot: Bot) => void
  ): void;
}
