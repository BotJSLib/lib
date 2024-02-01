import { Listener } from "./base-listener.js";
import { Bot } from "../bot.js";
import { Base } from "../wrapper/base.js";
import { ChatEvents } from "twitch-js";

export class TwitchListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: Function): void {}

  registerMemberRemove(fun: Function): void {}

  registerMessageUpdate(fun: Function): void {}

  registerMessageCreate(fun: Function): void {
    this.base.subscribe(ChatEvents.ALL, async (message: any) => {
      if (!("message" in message)) return;
      
      const user = this.bot.getUser(message.username);
 
      fun(user, message.message);
    });
  }
}
