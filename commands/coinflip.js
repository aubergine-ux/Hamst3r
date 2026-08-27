const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 1. This sets up how the command looks inside Discord
    data: new SlashCommandBuilder()
        .setName('coinflip') // Must be lowercase, no spaces
        .setDescription('Flip a Coin, Heads or Tails~'),

    // 2. This is what happens when someone types the command
    async execute(interaction) {

        const result = Math.random() > 0.5 ? 'HEADS!!!' : 'TAILS!!!'; 
        // Send a message back to the user
        await interaction.reply(`The coin has landed on: **${result}**`);
    },
};
