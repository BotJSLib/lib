import { User } from "./objects/user.js";
import { Guild } from "./objects/guild.js";
import { MetadataStorage } from "./storage/metadata.js";
import { Listener } from "./listeners/base-listener.js";
import { DiscordListener } from "./listeners/discord-listener.js";
import { TelegramListener } from "./listeners/telegram-listener.js";
import { Base } from "./wrapper/base.js";
import { DiscordBase } from "./wrapper/discord.js";
import { TelegramBase } from "./wrapper/telegram.js";
import { SlackBase } from "./wrapper/slack.js";
import { SlackListener } from "./listeners/slack-listener.js";
import { WhatsappBase } from "./wrapper/whatsapp.js";
import { WhatsappListener } from "./listeners/whatsapp-listener.js";

export class Bot {
  token: string;
  platform: Platform;
  base: Base;
  cache: Map<string, any> = new Map();

  constructor(token: string, platform: Platform, options?: any) {
    this.token = token;
    this.platform = platform;
    switch (platform) {
      case Platform.Discord:
        this.base = new DiscordBase(this, token);
        break;
      case Platform.Telegram:
        this.base = new TelegramBase(this, token);
        break;
      case Platform.Slack:
        this.base = new SlackBase(this, options);
        break;
      case Platform.Whatsapp:
        this.base = new WhatsappBase(this, token, options);
    }
  }

  async start() {
    await this.base.start();
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

  async loadCommands() {
    await this.base.registerCommands();
  }

  async loadEvents() {
    let listener: Listener | null = null;
    if (this.base instanceof DiscordBase) {
      listener = new DiscordListener(this);
    }
    if (this.base instanceof TelegramBase) {
      listener = new TelegramListener(this);
    }
    if (this.base instanceof SlackBase) {
      listener = new SlackListener(this);
    }
    if (this.base instanceof WhatsappBase) {
      listener = new WhatsappListener(this);
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
  Slack = "slack",
  Whatsapp = "whatsapp",
}
