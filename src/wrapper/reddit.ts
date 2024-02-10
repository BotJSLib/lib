import { Bot } from "../bot.js";
import { Guild } from "../objects/guild.js";
import { User } from "../objects/user.js";
import { Base } from "./base.js";
import { MetadataStorage } from "../storage/metadata.js";
import { Message, MessageBuilder } from "../objects/message.js";
import snoowrap from "snoowrap";
import { EventEmitter } from "node:events";

class Emitter extends EventEmitter {}

export class RedditBase implements Base {
  client: snoowrap;
  bot: Bot;
  emitter: Emitter = new Emitter();
  subs: string[] = [];

  constructor(bot: Bot, options: any) {
    this.bot = bot;
    this.client = new snoowrap({
      userAgent: options.userAgent,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      username: options.username,
      password: options.password,
    });
    this.subs = options.subs;
  }

  async start(): Promise<void> {
    setInterval(() => {
      for (const sub of this.subs) {
        this.client
          .getSubreddit(sub)
          .getNew()
          .then((posts) => {
            for (const post of posts) {
              this.emitter.emit(
                "message",
                new User(post.author.name, this.bot),
                post.title,
                new Guild(sub, this.bot),
                post.id
              );
            }
          });
      }

      for (const sub of this.subs) {
        this.client
          .getSubreddit(sub)
          .getNewComments()
          .then((comments) => {
            for (const comment of comments) {
              this.emitter.emit(
                "message",
                new User(comment.author.name, this.bot),
                comment.body,
                new Guild(sub, this.bot),
                comment.id
              );
            }
          });
      }
    });
  }

  subscribe(event: string, callback: Function): void {
    this.emitter.on(event, callback as any);
  }

  removeListeners(): void {
    this.emitter.removeAllListeners();
  }

  async registerCommands(): Promise<void> {
    for (const command of MetadataStorage.getInstance().commands.values()) {
      this.emitter.on(
        "message",
        async (
          author: User,
          message: string,
          guild: Guild,
          channel: string
        ) => {
          if (message.startsWith(command.name)) {
            const args = new Map<string, string>();
            const split = message.split(" ");
            for (let i = 0; i < command.args.length; i++) {
              args.set(command.args[i]!.name, split[i + 1] || "");
            }
            const response = await command.callback(author, args);
            if (response) {
              this.sendToChannel(channel, response, guild.id);
            }
          }
        }
      );
    }
  }

  getGuild(id: string): Promise<Guild> {
    const subReddit = this.client.getSubreddit(id);
    return new Promise((resolve, reject) => {
      subReddit.fetch().then((data) => {
        const guild = new Guild(id, this.bot);
        guild.name = data.display_name;
        guild.iconUrl = data.icon_img;
        resolve(guild);
      });
    });
  }

  async getUser(id: string): Promise<User> {
    const user = this.client.getUser(id);
    return new Promise((resolve, reject) => {
      user.fetch().then((data) => {
        const obj = new User(id, this.bot);
        obj.username = data.name;
        obj.avatarUrl = data.icon_img;
        resolve(obj);
      });
    });
  }

  async banUser(id: string, guild: string, reason: string): Promise<void> {
    this.client.getSubreddit(guild).banUser({
      name: id,
      banReason: reason,
    });
  }

  async kickUser(id: string, guild: string, reason: string): Promise<void> {
    this.client.getSubreddit(guild).removeContributor({
      name: id,
    });
  }

  async muteUser(id: string, guild: string, time: number): Promise<void> {
    this.client.getSubreddit(guild).muteUser({
      name: id,
    });
  }

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    await this.client.composeMessage({
      to: id,
      subject: message.content,
      text: message.content,
    });
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild: string
  ): Promise<void> {
    this.client.getSubmission(id).reply(message.content);
  }

  async getHistory(
    channel: string,
    guild?: string | undefined
  ): Promise<Message[]> {
    return this.client
      .getSubmission(channel)
      .fetch()
      .then((data) => {
        return data.comments.map((comment) => {
          return new Message(
            comment.id,
            this.bot.getGuild(guild!),
            comment.body,
            channel
          );
        });
      });
  }
}
