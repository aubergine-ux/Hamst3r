const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 1. This sets up how the command looks inside Discord
    data: new SlashCommandBuilder()
        .setName('catfact') // Must be lowercase, no spaces
        .setDescription('Random Cat Facts'),

    // 2. This is what happens when someone types the command
    async execute(interaction) {

        await interaction.deferReply();

        try {
            const response = await fetch('https://catfact.ninja/fact');
            const data = await response.json();
            
            await interaction.editReply(data.fact);
        } catch (error) {
            await interaction.editReply('Meow, Uh looks like a racoon bit the internet line again...')
        }
    },
};
