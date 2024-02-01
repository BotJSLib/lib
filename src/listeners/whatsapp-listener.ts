import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { Listener } from "./base-listener.js";

export class WhatsappListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: Function): void {}

  registerMemberRemove(fun: Function): void {}

  registerMessageUpdate(fun: Function): void {
    this.base.subscribe("message_update", fun);
  }

  registerMessageCreate(fun: Function): void {
    this.base.subscribe("message", fun);
  }
}
