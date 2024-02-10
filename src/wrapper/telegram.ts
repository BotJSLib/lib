import TelegramBot from "node-telegram-bot-api";
import { Bot } from "../bot.js";
import { Guild } from "../objects/guild.js";
import { User } from "../objects/user.js";
import { Base } from "./base.js";
import { MetadataStorage } from "../storage/metadata.js";
import { Message, MessageBuilder } from "../objects/message.js";

export class TelegramBase implements Base {
  token: string;
  client: TelegramBot;
  bot: Bot;

  constructor(bot: Bot, token: string) {
    this.token = token;
    this.bot = bot;
    this.client = new TelegramBot(token, { polling: true });
  }

  async start(): Promise<void> {}

  subscribe(event: string, callback: Function): void {
    this.client.on(event, callback as any);
  }

  removeListeners(): void {
    this.client.removeAllListeners();
    for (const command of MetadataStorage.getInstance().commands.values()) {
      this.client.removeTextListener(new RegExp(`^\/${command.name}$`));
    }
  }

  async registerCommands(): Promise<void> {
    this.client.on("callback_query", async (query) => {
      const action = query.data;
      const msg = query.message;
      const button = MetadataStorage.getInstance().buttons.get(action!);
      if (button) {
        const user = this.bot.getUser(msg!.chat.id.toString());
        const response: MessageBuilder = button(user);
        if (response) user.send(response);
      }
    });

    this.client.onText(/^(.+):(.+)$/, async (msg, match) => {
      const action = match![1];
      const data = match![2];
      const selectMenu = MetadataStorage.getInstance().selectMenu.get(action!);
      if (selectMenu) {
        const user = this.bot.getUser(msg.chat.id.toString());
        const response: MessageBuilder = selectMenu(user, data);
        if (response) user.send(response);
      }
    });

    for (const command of MetadataStorage.getInstance().commands.values()) {
      const regex = new RegExp(`^\/${command.name}$`);
      this.client.onText(regex, async (msg, match) => {
        const user = this.bot.getUser(msg.chat.id.toString());
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

  async getGuild(id: string): Promise<Guild> {
    const user = await this.client.getChat(id);
    const obj = new Guild(id, this.bot);
    obj.name = user.first_name;
    obj.iconUrl = user.photo?.big_file_id;
    return obj;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.client.getChat(id);
    const obj = new User(id, this.bot);
    obj.username = user.first_name;
    obj.avatarUrl = user.photo?.big_file_id;
    return obj;
  }

  async banUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.banChatMember(guild, Number(id));
  }

  async kickUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.banChatMember(guild, Number(id), {
      until_date: Math.floor(Date.now() / 1000) + 1,
    });
  }

  async muteUser(id: string, guild: string, time: number): Promise<void> {
    await this.client.restrictChatMember(id, Number(guild), {
      until_date: Math.floor(Date.now() / 1000) + time,
    });
  }

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    await this.client.sendMessage(id, message.content, message.toTelegram());
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string | undefined
  ): Promise<void> {
    await this.client.sendMessage(id, message.content, message.toTelegram());
  }

  async getHistory(
    channel: string,
    guild?: string | undefined
  ): Promise<Message[]> {
    return [];
  }
}
