import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import { Message } from "../objects/message.js";

export class SlackListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: (user: User, guild: Guild, bot: Bot) => void): void {
    this.base.subscribe("member_joined_channel", async (event: any) => {
      const user = this.bot.getUser(event.payload.user);
      const guild = this.bot.getGuild(event.payload.channel);
      fun(user, guild, this.bot);
    });
  }

  registerMemberRemove(
    fun: (user: User, guild: Guild, bot: Bot) => void
  ): void {
    this.base.subscribe("member_left_channel", async (event: any) => {
      const user = this.bot.getUser(event.payload.user);
      const guild = this.bot.getGuild(event.payload.channel);

      fun(user, guild, this.bot);
    });
  }

  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message, bot: Bot) => void
  ): void {
    this.base.subscribe("message", async (event: any) => {
      if (event.payload.subtype === "message_changed") {
        const user = this.bot.getUser((event.payload.message as any).user);
        const guild = this.bot.getGuild(event.payload.channel);
        fun(
          user,
          (event.payload.message as any).text,
          new Message(
            event.payload.message.ts,
            guild,
            (event.payload.message as any).text
          ),
          this.bot
        );
      }
    });
  }

  registerMessageCreate(fun: (user: User, message: Message, bot: Bot) => void): void {
    this.base.subscribe("message", async (event: any) => {
      if (!event.payload.subtype) {
        const user = this.bot.getUser(event.payload.user);
        const guild = this.bot.getGuild(event.payload.channel);
        fun(user, new Message(event.payload.ts, guild, event.payload.text), this.bot);
      }
    });
  }
}
