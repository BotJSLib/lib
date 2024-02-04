import {
  Client,
  IntentsBitField,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { Guild } from "../objects/guild.js";
import { User } from "../objects/user.js";
import { Base } from "./base.js";
import {
  handleCommandDiscord,
  handleButtonDiscord,
  handleSelectMenuDiscord,
} from "../listeners/discord-interactions.js";
import { MetadataStorage } from "../storage/metadata.js";
import { Bot } from "../bot.js";
import { MessageBuilder } from "../objects/message.js";

export class DiscordBase implements Base {
  token: string;
  client: Client;
  bot: Bot;

  constructor(bot: Bot, token: string) {
    this.token = token;
    this.bot = bot;
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
      ],
      partials: [Partials.Channel, Partials.Message],
    });
  }

  async start(): Promise<void> {
    await this.client.login(this.token);
  }
  subscribe(event: string, callback: Function): void {
    this.client.on(event, callback as any);
  }
  removeListeners(): void {
    this.client.removeAllListeners();
  }
  async registerCommands(): Promise<void> {
    handleCommandDiscord(this.bot);
    handleButtonDiscord(this.bot);
    handleSelectMenuDiscord(this.bot);
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
    await rest.put(Routes.applicationCommands(this.client.user!.id), {
      body: commands,
    });
  }

  async getGuild(id: string): Promise<Guild> {
    const guild = await this.client.guilds.fetch(id);
    const obj = new Guild(id, this.bot);
    obj.name = guild.name;
    obj.iconUrl = guild.iconURL() ?? undefined;
    return obj;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.client.users.fetch(id);
    const obj = new User(id, this.bot);
    obj.username = user.username;
    obj.avatarUrl = user.avatarURL() ?? undefined;
    return obj;
  }

  async banUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.guilds.fetch(guild).then((guild) => {
      guild.members.ban(id, { reason: reason });
    });
  }

  async kickUser(id: string, guild: string, reason: string): Promise<void> {
    await this.client.guilds.fetch(guild).then((guild) => {
      guild.members.kick(id, reason);
    });
  }

  async muteUser(id: string, guild: string, time: number): Promise<void> {
    await this.client.guilds.fetch(guild).then((guild) => {
      guild.members.fetch(id).then((member) => {
        member.timeout(time, "Muted");
      });
    });
  }

  async sendToUser(id: string, message: MessageBuilder): Promise<void> {
    const user = await this.client.users.fetch(id);
    await user.send(message.toDiscord());
  }

  async sendToChannel(
    id: string,
    message: MessageBuilder,
    guild?: string | undefined
  ): Promise<void> {
    const channel = this.client.channels.cache.get(id);
    if (channel instanceof TextChannel) {
      await channel.send(message.toDiscord());
    }
  }
}
