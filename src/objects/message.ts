import {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder as DiscordButtonBuilder,
  BaseMessageOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ButtonBuilder } from "./button.js";
import { SelectMenuBuilder } from "./select-menu/menu.js";
import { SelectMenuOption } from "./select-menu/option.js";

export class MessageBuilder {
  content: string;
  buttons: ButtonBuilder[] = [];
  selectMenu?: SelectMenuBuilder;

  constructor(content: string) {
    this.content = content;
  }

  addButton(button: ButtonBuilder) {
    this.buttons.push(button);
    return this;
  }

  createSelectMenu(label: string, data: string) {
    this.selectMenu = new SelectMenuBuilder(label, data);
    return this;
  }

  addOption(option: SelectMenuOption) {
    this.selectMenu?.addOption(option);
    return this;
  }

  toDiscord(): BaseMessageOptions {
    const components = [];

    if (this.buttons.length > 0) {
      const row = new ActionRowBuilder<DiscordButtonBuilder>();
      for (const button of this.buttons) {
        row.addComponents(
          new DiscordButtonBuilder()
            .setCustomId(button.data)
            .setLabel(button.label)
            .setStyle(ButtonStyle.Primary)
        );
      }

      components.push(row);
    }

    if (this.selectMenu) {
      const row = new ActionRowBuilder<StringSelectMenuBuilder>();
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(this.selectMenu.data)
          .setPlaceholder(this.selectMenu.label)
          .addOptions(
            this.selectMenu.options.map((option) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(option.label)
                .setValue(option.data)
            )
          )
      );

      components.push(row);
    }

    return {
      content: this.content,
      components,
    };
  }

  toTelegram() {
    const buttons = [];
    for (const button of this.buttons) {
      buttons.push({
        text: button.label,
        callback_data: button.data,
      });
    }

    const keyboard = [];
    if (this.selectMenu) {
      for (const option of this.selectMenu.options) {
        keyboard.push([this.selectMenu.data + ":" + option.data]);
      }
    }

    const reply_markup = {
      inline_keyboard: [buttons],
      keyboard,
    };

    return {
      reply_markup,
    };
  }
}
