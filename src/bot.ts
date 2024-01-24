import { Client, REST, Routes, SlashCommandBuilder } from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import { User } from "./objects/user";
import { Command } from "./objects/command";
import JoinEvent from "./events/join";
import MessageEvent from "./events/message";
import LeaveEvent from "./events/leave";
import MessageEditEvent from "./events/message-edit";
import { Guild } from "./objects/guild";

export class Bot {
  token: string;
  platform: Platform;
  base: Client | TelegramBot;
  commands: Map<string, Command> = new Map();
  cache: Map<string, any> = new Map();

  constructor(token: string, platform: Platform) {
    this.token = token;
    this.platform = platform;

    if (this.platform === Platform.Discord) {
      this.base = new Client({ intents: [] });
    } else {
      this.base = new TelegramBot(token, { polling: true });
    }

    new LeaveEvent(this);
    new JoinEvent(this);
    new MessageEvent(this);
    new MessageEditEvent(this);
  }

  async start() {
    if (this.base instanceof Client) {
      await this.base.login(this.token);
    }
  }

  getUser(id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    return new User(id, this);
  }

  getGuild(id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    return new Guild(id, this);
  }

  registerCommand(command: Command) {
    this.commands.set(command.name, command);

    if (this.base instanceof TelegramBot) {
      const regex = new RegExp(`^\/${command}$`);
      this.base.onText(regex, async (msg, match) => {
        const user = this.getUser(msg.chat.id.toString());
        const args = new Map<string, string>();
        if (match) {
          match.forEach((arg, i) => {
            if (i > 0) {
              args.set(command.args[i - 1].name, arg);
            }
          });
        }
        command.callback(user, args);
      });
    }
  }

  onButton(callback: (user: User, data: string) => void) {
    if (this.base instanceof TelegramBot) {
      this.base.on("callback_query", async (query) => {
        const user = this.getUser(query.message!.chat.id.toString());
        callback(user, query.data!);
      });
    } else {
      this.base.on("interactionCreate", async (interaction) => {
        if (interaction.isButton()) {
          const user = this.getUser(interaction.user.id);
          callback(user, interaction.customId);
        }
      });
    }
  }

  async loadCommands() {
    if (this.base instanceof Client) {
      const rest = new REST({ version: "9" }).setToken(this.token);
      const commands = [];
      for (const command of this.commands.values()) {
        const cmd = new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description);
        for (const arg of command.args) {
          cmd.addStringOption((option) => {
            return option
              .setName(arg.name)
              .setDescription(arg.description)
              .setRequired(arg.required);
          });
        }
        commands.push(cmd);
      }

      await rest.put(Routes.applicationCommands(this.base.user!.id), {
        body: commands,
      });
    }
  }
  getBot(): Bot {
    return this;
  }
}

export enum Platform {
  Discord = "discord",
  Telegram = "telegram",
}
