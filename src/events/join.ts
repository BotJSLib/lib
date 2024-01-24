import { Client } from "discord.js";
import { Event } from "./event";
import { User } from "../objects/user";

export default class JoinEvent extends Event {
  onJoin(callback: (memeber: User) => void) {
    const base = this.getBot().base;
    if (base instanceof Client) {
      base.on("guildMemberAdd", async (member) => {
        const user = this.getBot().getUser(member.id);
        callback(user);
      });
    } else {
      base.on("new_chat_members", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        callback(user);
      });
    }
  }
}