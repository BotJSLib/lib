import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
} from "discord.js";
import { Bot } from "../bot";
import Button from "./button";

export class User {
  id: string;
  bot: Bot;

  username?: string;
  avatarUrl?: string;

  constructor(id: string, bot: Bot) {
    this.id = id;
    this.bot = bot;
  }

  async send(message: string, button?: Button) {
    if (this.bot.base instanceof Client) {
      const user = await this.bot.base.users.fetch(this.id);
      if (button) {
        const discordButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel(button.label)
          .setCustomId(button.data);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          discordButton
        );
        await user.send({ components: [row], content: message });
        return;
      }
      await user.send(message);
    } else {
      if (button) {
        const telegramButton = {
          text: button.label,
          callback_data: button.data,
        };
        await this.bot.base.sendMessage(this.id, message, {
          reply_markup: {
            inline_keyboard: [[telegramButton]],
          },
        });
        return;
      }
      await this.bot.base.sendMessage(this.id, message);
    }
  }

  async fetch() {
    if (this.bot.base instanceof Client) {
      const user = await this.bot.base.users.fetch(this.id);
      this.username = user.username;
      this.avatarUrl = user.displayAvatarURL();
    } else {
      const user = await this.bot.base.getChat(this.id);
      this.username = user.username;
      this.avatarUrl = user.photo?.big_file_id;
    }
  }
}
