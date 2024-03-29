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
import { TwitchBase } from "./wrapper/twitch.js";
import { TwitchListener } from "./listeners/twitch-listener.js";
import { RedditBase } from "./wrapper/reddit.js";
import { RedditListener } from "./listeners/reddit-listener.js";

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
        break;
      case Platform.Twitch:
        this.base = new TwitchBase(this, token, options);
        break;
      case Platform.Reddit:
        this.base = new RedditBase(this, options);
        break;
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

    switch (true) {
      case this.base instanceof DiscordBase:
        listener = new DiscordListener(this);
        break;
      case this.base instanceof TelegramBase:
        listener = new TelegramListener(this);
        break;
      case this.base instanceof SlackBase:
        listener = new SlackListener(this);
        break;
      case this.base instanceof WhatsappBase:
        listener = new WhatsappListener(this);
        break;
      case this.base instanceof TwitchBase:
        listener = new TwitchListener(this);
        break;
      case this.base instanceof RedditBase:
        listener = new RedditListener(this);
        break;
    }

    if (!listener) {
      throw new Error("Platform not supported");
    }

    MetadataStorage.getInstance().events.forEach((fun: any, event) => {
      switch (event) {
        case "join":
          fun.forEach((f: any) => listener!.registerMemberAdd(f));
          break;
        case "leave":
          fun.forEach((f: any) => listener!.registerMemberRemove(f));
          break;
        case "message-edit":
          fun.forEach((f: any) => listener!.registerMessageUpdate(f));
          break;
        case "message":
          fun.forEach((f: any) => listener!.registerMessageCreate(f));
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
  Twitch = "twitch",
  Reddit = "reddit",
}
