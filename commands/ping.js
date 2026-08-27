const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  // 1. Define the command configuration
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the hamster is awake.'),

  // 2. Define the execution logic
  async execute(interaction) {
    try {
      await interaction.reply('🐹 pong');
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
