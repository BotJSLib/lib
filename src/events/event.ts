import { Bot } from "../bot";

export abstract class Event {
  constructor(protected bot: Bot) {}
  getBot() {
    return this.bot;
  }
}