import chalk from "chalk";
import { Bot, Platform } from "./bot";

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
}