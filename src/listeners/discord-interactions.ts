import { Interaction } from "discord.js";
import { Bot } from "../bot.js";
import { MetadataStorage } from "../storage/metadata.js";
import { MessageBuilder } from "../objects/message.js";

export async function handleCommandDiscord(bot: Bot) {
  bot.base.subscribe("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const user = bot.getUser(interaction.user.id);
    const command = interaction.commandName;
    const args = new Map<string, string>();
    interaction.options.data.forEach((arg) => {
      args.set(arg.name, arg.value as string);
    });
    const response = await MetadataStorage.getInstance()
      .commands.get(command)
      ?.callback(user, args);

    if (response) {
      await interaction.reply(response.toDiscord());
    }
  });
}

export async function handleButtonDiscord(bot: Bot) {
  bot.base.subscribe("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const user = bot.getUser(interaction.user.id);
    const button = interaction.customId;
    const response: MessageBuilder = await MetadataStorage.getInstance()
      .buttons.get(button)
      ?.call(user);
    if (response) {
      await interaction.reply(response.toDiscord());
    }
  });
}

export async function handleSelectMenuDiscord(bot: Bot) {
  bot.base.subscribe("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const user = bot.getUser(interaction.user.id);
    const selectMenu = interaction.customId;
    const response: MessageBuilder =
      await MetadataStorage.getInstance().selectMenu.get(selectMenu)!(
        user,
        interaction.values[0]
      );
    if (response) {
      await interaction.reply(response.toDiscord());
    }
  });
}
