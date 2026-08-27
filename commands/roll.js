const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 1. This sets up how the command looks inside Discord
    data: new SlashCommandBuilder()
        .setName('roll') // Must be lowercase, no spaces
        .setDescription('Rolls a 6-Sided Dice!'),

    // 2. This is what happens when someone types the command
    async execute(interaction) {
        
        const rollResult = Math.floor(Math.random() * 6) + 1;
        // Send a message back to the user
        await interaction.reply(`🎲 The Dice has landed on **${rollResult}**!`);
    },
};
