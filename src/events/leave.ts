import { Client } from "discord.js";
import { Event } from "./event";
import { User } from "../objects/user";

export default class LeaveEvent extends Event {
  onLeave(callback: (memeber: User) => void) {
    const base = this.getBot().base;
    if (base instanceof Client) {
      base.on("guildMemberRemove", async (member) => {
        const user = this.getBot().getUser(member.id);
        callback(user);
      });
    } else {
      base.on("left_chat_member", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        callback(user);
      });
    }
  }
}