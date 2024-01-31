import { Listener } from "./base-listener";
import { Bot } from "../bot";
import { Base } from "../wrapper/base";

export class TelegramListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: Function): void {
    this.base.subscribe("new_chat_members", async (msg: any) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user);
    });
  }

  registerMemberRemove(fun: Function): void {
    this.base.subscribe("left_chat_member", async (msg: any) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user);
    });
  }

  registerMessageUpdate(fun: Function): void {
    this.base.subscribe("edited_message", async (msg: any) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user, msg.text, msg.text);
    });
  }
  
  registerMessageCreate(fun: Function): void {
    this.base.subscribe("message", async (msg: any) => {
      const user = this.bot.getUser(msg.chat.id.toString());
      fun(user, msg.text);
    });
  }
}
