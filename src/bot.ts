import {
  Client,
  IntentsBitField,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import { User } from "./objects/user.js";
import { Guild } from "./objects/guild.js";
import { handleCommandDiscord } from "./listeners/commands.js";
import MetadataStorage from "./storage/metadata.js";

export class Bot {
  token: string;
  platform: Platform;
  base: Client | TelegramBot;
  cache: Map<string, any> = new Map();

  constructor(token: string, platform: Platform) {
    this.token = token;
    this.platform = platform;

    if (this.platform === Platform.Discord) {
      this.base = new Client({
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildModeration,
          IntentsBitField.Flags.MessageContent,
        ],
        partials: [Partials.Channel, Partials.Message],
      });
    } else {
      this.base = new TelegramBot(token, { polling: true });
    }
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
      handleCommandDiscord(this);
      const rest = new REST({ version: "9" }).setToken(this.token);
      const commands = [];
      for (const command of MetadataStorage.getInstance().commands.values()) {
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

    if (this.base instanceof TelegramBot) {
      for (const command of MetadataStorage.getInstance().commands.values()) {
        const regex = new RegExp(`^\/${command.name}$`);
        this.base.onText(regex, async (msg, match) => {
          const user = this.getUser(msg.chat.id.toString());
          const args = new Map<string, string>();
          if (match) {
            match.forEach((arg, i) => {
              if (i > 0) {
                args.set(command.args[i - 1]!.name, arg);
              }
            });
          }
          const response = command.callback(user, args);
          user.send(response);
        });
      }
    }
  }

  async loadEvents() {
    if (this.base instanceof Client) {
      this.base.on("guildMemberAdd", async (member) => {
        const user = this.getBot().getUser(member.id);
        const events = MetadataStorage.getInstance().events.get("join");
        if (events) {
          events.forEach((event) => {
            event(user);
          });
        }
      });

      this.base.on("guildMemberRemove", async (member) => {
        const user = this.getBot().getUser(member.id);
        const events = MetadataStorage.getInstance().events.get("leave");
        if (events) {
          events.forEach((event) => {
            event(user);
          });
        }
      });

      this.base.on("messageUpdate", async (msg, newMsg) => {
        const user = this.getBot().getUser(msg.author!.id);
        const events = MetadataStorage.getInstance().events.get("message-edit");
        if (events) {
          events.forEach((event) => {
            event(user, msg.content || "", newMsg.content || "");
          });
        }
      });


      this.base.on("messageCreate", async (msg) => {
        const user = this.getBot().getUser(msg.author.id);
        const events = MetadataStorage.getInstance().events.get("message");
        if (events) {
          events.forEach((event) => {
            event(user, msg.content);
          });
        }
      });
    }
    if (this.base instanceof TelegramBot) {
      this.base.on("new_chat_members", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        const events = MetadataStorage.getInstance().events.get("join");
        if (events) {
          events.forEach((event) => {
            event(user);
          });
        }
      });

      this.base.on("left_chat_member", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        const events = MetadataStorage.getInstance().events.get("leave");
        if (events) {
          events.forEach((event) => {
            event(user);
          });
        }
      });

      this.base.on("edited_message", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        const events = MetadataStorage.getInstance().events.get("message-edit");
        if (events) {
          events.forEach((event) => {
            event(user, "", msg.text || "");
          });
        }
      });

      this.base.on("message", async (msg) => {
        const user = this.getBot().getUser(msg.chat.id.toString());
        const events = MetadataStorage.getInstance().events.get("message");
        if (events) {
          events.forEach((event) => {
            event(user, msg.text || "");
          });
        }
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
