const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aubergine')
        .setDescription('Links to the Developer'),

    async execute(interaction) {
        await interaction.reply('Follow the Dev: https://github.com/aubergine-ux');
    },
};
