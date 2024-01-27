import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  StringSelectMenuBuilder,
} from "discord.js";
import { Bot } from "../bot.js";
import Button from "./button.js";
import SelectMenu from "./select-menu/menu.js";

export class User {
  id: string;
  bot: Bot;

  username?: string;
  avatarUrl?: string;

  constructor(id: string, bot: Bot) {
    this.id = id;
    this.bot = bot;
  }

  async send(message: string, button?: Button, selectMenu?: SelectMenu) {
    if (this.bot.base instanceof Client) {
      const user = await this.bot.base.users.fetch(this.id);
      const components = [];
      if (button) {
        const discordButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel(button.label)
          .setCustomId(button.data);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          discordButton
        );
        components.push(row);
      }
      if (selectMenu) {
        const discordSelectMenu = new StringSelectMenuBuilder()
          .setCustomId(selectMenu.data)
          .setPlaceholder(selectMenu.label)
          .setOptions(
            selectMenu.options.map((option) => ({
              label: option.label,
              value: option.data,
            }))
          );
        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            discordSelectMenu
          );
        components.push(row);
      }
      await user.send({ components, content: message });
    } else {
      const inlineKeyboard = [];
      const keyboard = [];
      if (button) {
        const telegramButton = {
          text: button.label,
          callback_data: button.data,
        };
        inlineKeyboard.push([telegramButton]);
      }
      if (selectMenu) {
        const telegramButtons = selectMenu.options.map((option) => ({
          text: option.label,
          callback_data: option.data,
        }));
        keyboard.push(telegramButtons);
      }
      await this.bot.base.sendMessage(this.id, message, {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
          keyboard,
        },
      });
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

    this.bot.cache.set(this.id, this);
  }
}
