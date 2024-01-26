import { Client } from "discord.js";
import { Bot } from "../bot";
import MetadataStorage from "../storage/metadata";

export async function handleCommandDiscord(bot: Bot) {
  (bot.base as Client).on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const user = bot.getUser(interaction.user.id);
    const command = interaction.commandName;
    const args = new Map<string, string>();
    interaction.options.data.forEach((arg) => {
      args.set(arg.name, arg.value as string);
    });
    const response = MetadataStorage.getInstance().commands
      .get(command)
      ?.callback(user, args);
    if (response) {
      interaction.reply(response);
    }
  });
}
