import { App, BlockElementAction, LogLevel, StaticSelectAction } from "@slack/bolt";
import { Bot } from "../bot.js";
import { Base } from "./base.js";
import { MetadataStorage } from "../storage/metadata.js";
import { MessageBuilder } from "../objects/message.js";
import { Guild } from "../objects/guild.js";
import { User } from "../objects/user.js";

export class SlackBase implements Base {
  options: any;
  client: App;
  bot: Bot;

  constructor(bot: Bot, options: any) {
    this.options = options;
    this.bot = bot;
    this.client = this.recreate();
  }

  private recreate() {
    this.client = new App({
      token: this.options.token,
      signingSecret: this.options.signingSecret,
      socketMode: true,
      appToken: this.options.appToken,
      logLevel: LogLevel.WARN,
    });
    return this.client;
  }

  async start(): Promise<void> {
    await this.client.start(this.options.port || 3000);
  }

  subscribe(event: string, callback: Function): void {
    this.client.event(event, callback as any);
  }

  removeListeners(): void {
    this.client.stop();
    this.client = this.recreate();
    this.client.start(this.options.port || 3000);
  }

  async registerCommands(): Promise<void> {
    for (const command of MetadataStorage.getInstance().commands.values()) {
      this.client.command("/" + command.name, async ({ ack, say, payload }) => {
        await ack();
        const user = this.bot.getUser(payload.user_id);
        const args = new Map<string, string>();
        if (payload.text) {
          const split = payload.text.split(" ");
          for (let i = 0; i < split.length; i++) {
            args.set(command.args[i]!.name, split[i]!);
          }
        }
        const response: MessageBuilder = command.callback(user, args);
        if (response) {
          await say(response.toSlack());
        }
      });
    }

    MetadataStorage.getInstance().buttons.forEach((callback, id) => {
      this.client.action(id, async ({ ack, say, payload, body }) => {
        await ack();
        const user = this.bot.getUser(body.user.id);
        const response: MessageBuilder = callback(user);
        if (response) await say(response.toSlack());
      });
    });

    MetadataStorage.getInstance().selectMenu.forEach((callback, id) => {
      this.client.action(id, async ({ ack, say, payload, body }) => {
        await ack();
        const block = payload as StaticSelectAction;
        const user = this.bot.getUser(body.user.id);
        const response: MessageBuilder = callback(user, block.selected_option!.value);
        if (response) await say(response.toSlack());
      });
    });
  }

  async getGuild(id: string): Promise<Guild> {
    const guild = await this.client.client.conversations.info({
      channel: id,
    });
    const obj = new Guild(id, this.bot);
    obj.name = guild.channel!.name;
    return obj;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.client.client.users.info({
      user: id,
    });
    const obj = new User(id, this.bot);
    obj.username = user.user!.name;
    obj.avatarUrl = user.user!.profile!.image_192;
    return obj;
  }

  async banUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.client.conversations.kick({
      channel: guild,
      user: id,
    });
  }

  async kickUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.client.conversations.kick({
      channel: guild,
      user: id,
    });
  }

  async muteUser(id: string, guild: string, time: number): Promise<void> {}

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    await this.client.client.chat.postMessage({
      channel: id,
      ...message.toSlack(),
    });
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string | undefined
  ): Promise<void> {
    await this.client.client.chat.postMessage({
      channel: id,
      ...message.toSlack(),
    });
  }
}
