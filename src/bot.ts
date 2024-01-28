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
import {
  handleButtonDiscord,
  handleCommandDiscord,
  handleSelectMenuDiscord,
} from "./listeners/discord-interactions.js";
import { MetadataStorage } from "./storage/metadata.js";
import { Listener } from "./listeners/base-listener.js";
import { DiscordListener } from "./listeners/discord-listener.js";
import { TelegramListener } from "./listeners/telegram-listener.js";
import { MessageBuilder } from "./objects/message.js";

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

  getUser(id: string): User {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    return new User(id, this);
  }

  getGuild(id: string): Guild {
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
      handleButtonDiscord(this);
      handleSelectMenuDiscord(this);
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
      this.base.on("callback_query", async (query) => {
        const action = query.data;
        const msg = query.message;
        const button = MetadataStorage.getInstance().buttons.get(action!);
        if (button) {
          const user = this.getUser(msg!.chat.id.toString());
          const response: MessageBuilder = button(user);
          if (response) user.send(response);
        }
      });

      this.base.onText(/^(.+):(.+)$/, async (msg, match) => {
        const action = match![1];
        const data = match![2];
        const selectMenu = MetadataStorage.getInstance().selectMenu.get(
          action!
        );
        if (selectMenu) {
          const user = this.getUser(msg.chat.id.toString());
          const response: MessageBuilder = selectMenu(user, data);
          if (response) user.send(response);
        }
      });

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
          const response: MessageBuilder = command.callback(user, args);
          if (response) user.send(response);
        });
      }
    }
  }

  async loadEvents() {
    let listener: Listener | null = null;
    if (this.base instanceof Client) {
      listener = new DiscordListener(this);
    }
    if (this.base instanceof TelegramBot) {
      listener = new TelegramListener(this);
    }

    if (!listener) {
      throw new Error("Platform not supported");
    }

    MetadataStorage.getInstance().events.forEach((fun, event) => {
      switch (event) {
        case "join":
          fun.forEach((f) => listener!.registerMemberAdd(f));
          break;
        case "leave":
          fun.forEach((f) => listener!.registerMemberRemove(f));
          break;
        case "message-edit":
          fun.forEach((f) => listener!.registerMessageUpdate(f));
          break;
        case "message":
          fun.forEach((f) => listener!.registerMessageCreate(f));
          break;
      }
    });
  }

  getBot(): Bot {
    return this;
  }
}

export enum Platform {
  Discord = "discord",
  Telegram = "telegram",
}
