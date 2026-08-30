const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user(s) avatar.')
        .addUserOption((option) =>
            option.setName('user').setDescription('The user to get the avatar of')
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 1024}))
            .setColor(0x5865F2);

            await interaction.reply({ embeds: [embed] });
    },
};