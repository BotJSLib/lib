import { Listener } from "./base-listener";
import { Bot } from "../bot";
import { Base } from "../wrapper/base";

export class SlackListener implements Listener {
  private bot: Bot;
  private base: Base;

  constructor(bot: Bot) {
    this.bot = bot;
    this.base = bot.base;
  }

  registerMemberAdd(fun: Function): void {
    this.base.subscribe("member_joined_channel", async (event: any) => {
      const user = this.bot.getUser(event.payload.user);
      fun(user);
    });
  }

  registerMemberRemove(fun: Function): void {
    this.base.subscribe("member_left_channel", async (event: any) => {
      const user = this.bot.getUser(event.payload.user);
      fun(user);
    });
  }

  registerMessageUpdate(fun: Function): void {
    this.base.subscribe("message", async (event: any) => {
      if (event.payload.subtype === "message_changed") {
        const user = this.bot.getUser((event.payload.message as any).user);
        fun(
          user,
          (event.payload.message as any).text,
          (event.payload.message as any).text
        );
      }
    });
  }

  registerMessageCreate(fun: Function): void {
    this.base.subscribe("message", async (event: any) => {
      if (!event.payload.subtype) {
        const user = this.bot.getUser(event.payload.user);
        fun(user, event.payload.text);
      }
    });
  }
}
