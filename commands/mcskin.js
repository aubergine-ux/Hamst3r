const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcskin')
        .setDescription('Get the Skin of any Minecraft Player!')
        .addStringOption((option) =>
            option.setName('name').setDescription('Minecraft Username').setRequired(true)
        ),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        const embed = new EmbedBuilder()
            .setTitle( `Skin of ${name}`)
            .setImage(`https://minotar.net/armor/body/${name}/700.png`)
            .setColor(0x5865F2)
            .setFooter({ text: 'Skins Powered by Minotar' });

        await interaction.reply({ embeds: [embed] });
    },
};