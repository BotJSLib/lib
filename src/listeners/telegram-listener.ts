import { Listener } from "./base-listener";
import { Bot } from "../bot";
import TelegramBot from "node-telegram-bot-api";

export class TelegramListener implements Listener {
  private bot: Bot;
  private base: TelegramBot;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base as TelegramBot;
  }

  registerMemberAdd(fun: Function): void {
    this.base.on("new_chat_members", async (msg) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user);
    });
  }
  registerMemberRemove(fun: Function): void {
    this.base.on("left_chat_member", async (msg) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user);
    });
  }
  registerMessageUpdate(fun: Function): void {
    this.base.on("edited_message", async (msg) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user, msg.text, msg.text);
    });
  }
  registerMessageCreate(fun: Function): void {
    this.base.on("message", async (msg) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user, msg.text);
    });
  }
}
