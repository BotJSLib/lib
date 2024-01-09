import { Client } from "discord.js";
import { Bot } from "../bot";

export async function handleCommandDiscord(bot: Bot) {
  (bot.base as Client).on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const user = bot.getUser(interaction.user.id);
    const command = interaction.commandName;
    const args = interaction.options.data.map((option) => option.value);

    if (bot.commands.has(command)) {
      bot.commands.get(command)!(user, args);
    }
  });
}
