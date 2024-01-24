import { Client } from "discord.js";
import { User } from "../objects/user";
import { Event } from "./event";

export default class MessageEditEvent extends Event {
  onMessageEdit(
    callback: (user: User, oldContent: string, newContent: string) => void
  ) {
    const base = this.getBot().base;
    if (base instanceof Client) {
      base.on("messageUpdate", async (msg, newMsg) => {
        const user = this.getBot().getUser(msg.author!.id);
        callback(user, msg.content || "", newMsg.content || "");
      });
    } else {
      base.on("edited_message", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        callback(user, "", msg.text || "");
      });
    }
  }
}
