import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { User } from "../objects/user.js";
import { Guild } from "../objects/guild.js";
import TelegramBot from "node-telegram-bot-api";
import { Message } from "../objects/message.js";

export class TelegramListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: (user: User, guild: Guild) => void): void {
    this.base.subscribe(
      "new_chat_members",
      async (msg: TelegramBot.Message) => {
        const user = this.bot.getUser(
          msg.from?.id.toString() || msg.chat.id.toString()
        );
        const guild = this.bot.getGuild(msg.chat.id.toString());
        fun(user, guild);
      }
    );
  }

  registerMemberRemove(fun: (user: User, guild: Guild) => void): void {
    this.base.subscribe(
      "left_chat_member",
      async (msg: TelegramBot.Message) => {
        const user = this.bot.getUser(
          msg.from?.id.toString() || msg.chat.id.toString()
        );
        const guild = this.bot.getGuild(msg.chat.id.toString());
        fun(user, guild);
      }
    );
  }

  registerMessageUpdate(
    fun: (user: User, oldContent: string, message: Message) => void
  ): void {
    this.base.subscribe("edited_message", async (msg: TelegramBot.Message) => {
      const user = this.bot.getUser(msg.from!.id.toString());
      const guild = this.bot.getGuild(msg.chat.id.toString());

      fun(
        user,
        msg.text!,
        new Message(msg.message_id.toString(), guild, msg.text!)
      );
    });
  }

  registerMessageCreate(fun: (user: User, message: Message) => void): void {
    this.base.subscribe("message", async (msg: TelegramBot.Message) => {
      const user = this.bot.getUser(msg.from!.id.toString());
      const guild = this.bot.getGuild(msg.chat.id.toString());

      fun(user, new Message(msg.message_id.toString(), guild, msg.text!));
    });
  }
}
