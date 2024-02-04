import chalk from "chalk";
import { Bot, Platform } from "./bot.js";
import { importx, resolve } from "@discordx/importer";
import chokidar from "chokidar";
import { Client } from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import { MetadataStorage } from "./storage/metadata.js";

const prefix = chalk.bgBlue(" BOT.JS ");

export class BotManager {
  bots: Bot[] = [];

  create(token: string, platform: Platform, options?: any) {
    const bot = new Bot(token, platform, options);
    this.bots.push(bot);
    return bot;
  }

  async start() {
    for (const bot of this.bots) {
      await bot.start();
      console.log(chalk.bold(`${prefix} Started bot ${bot.platform}`));
    }
  }

  async loadFiles(dir: string) {
    await importx(`${dir}/commands/**/*.{ts,js}`).then(() => {
      console.log(chalk.bold(`${prefix} Loaded commands`));
    });

    await importx(`${dir}/events/**/*.{ts,js}`).then(() => {
      console.log(chalk.bold(`${prefix} Loaded events`));
    });

    for (const bot of this.bots) {
      await bot.loadCommands();
      await bot.loadEvents();
      console.log(chalk.bold(`${prefix} Loaded files for bot ${bot.platform}`));
    }
  }

  async startDev(dir: string) {
    const pattern = `${dir}/{commands,events}/**/*.{ts,js}`;
    const watcher = chokidar.watch(pattern);

    await this.start();
    await this.reloadDevFiles(pattern);

    watcher.on("change", async (path) => {
      console.log(chalk.bold(`${prefix} File changed: ${path}`));
      await this.reloadDevFiles(pattern);
    });

    watcher.on("add", async (path) => {
      console.log(chalk.bold(`${prefix} File added: ${path}`));
      await this.reloadDevFiles(pattern);
    });

    watcher.on("unlink", async (path) => {
      console.log(chalk.bold(`${prefix} File removed: ${path}`));
      await this.reloadDevFiles(pattern);
    });
  }

  private async loadDevFiles(dir: string) {
    const files = await resolve(dir);
    try {
      const res = await Promise.all(
        files.map((file) => import(`${file}?version=${Date.now()}`))
      );
    } catch (e) {
      console.log(e);
    }
  }

  private async reloadDevFiles(dir: string) {
    for (const bot of this.bots) {
      bot.base.removeListeners();
    }

    MetadataStorage.getInstance().commands.clear();
    MetadataStorage.getInstance().events.clear();
    MetadataStorage.getInstance().buttons.clear();

    await this.loadDevFiles(dir);

    for (const bot of this.bots) {
      await bot.loadCommands();
      await bot.loadEvents();
    }
  }
}
