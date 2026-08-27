const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  // 1. Define the command configuration
  data: new SlashCommandBuilder()
    .setName('command_name') // Must be lowercase, no spaces
    .setDescription('A brief description of what this command does'),

  // 2. Define the execution logic
  async execute(interaction) {
    try {
      // Your command logic goes here!
      // Reply to the user
      await interaction.reply('Hello! This is a blank template response.');
    } catch (error) {
      console.error(`Error executing /${interaction.commandName}:`, error);

      const payload = {
        content: 'There was an error running that command.',
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
