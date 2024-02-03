import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { Message } from "../objects/message.js";

export interface Listener {
  registerMemberAdd(fun: (user: User, guild: Guild) => void): void;
  registerMemberRemove(fun: (user: User, guild: Guild) => void): void;
  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message) => void
  ): void;
  registerMessageCreate(fun: (user: User, message: Message) => void): void;
}
