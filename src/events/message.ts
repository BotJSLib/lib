import { Client } from "discord.js";
import { User } from "../objects/user";
import { Event } from "./event";

export default class MessageEvent extends Event {
  onMessage(callback: (user: User, message: string) => void) {
    const base = this.getBot().base;
    if (base instanceof Client) {
      base.on("message", async (msg) => {
        const user = this.getBot().getUser(msg.author.id);
        callback(user, msg.content);
      });
    } else {
      base.on("message", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        callback(user, msg.text || "");
      });
    }
  }
}