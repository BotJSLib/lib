import chalk from "chalk";
import { Bot, Platform } from "./bot";
import { dirname, importx, isESM } from "@discordx/importer";

const prefix = chalk.bgBlue(" BOT.JS ");

export default class BotManager {
  bots: Bot[] = [];

  create(token: string, platform: Platform) {
    const bot = new Bot(token, platform);
    this.bots.push(bot);
    return bot;
  }

  async start() {
    for (const bot of this.bots) {
      await bot.start();
      console.log(`${prefix} Started bot ${bot.platform}`);
    }
  }

  async loadFiles(dir: string) {
    await importx(`${dir}/commands/**/*.{ts,js}`).then(() => {
      console.log(`${prefix} Loaded commands`);
    });

    for (const bot of this.bots) {
      await bot.loadCommands();
      console.log(`${prefix} Loaded files for bot ${bot.platform}`);
    }
  }
}
