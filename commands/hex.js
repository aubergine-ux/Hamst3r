const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hex')
        .setDescription('Preview a hex color code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Hex code, e.g. #5865F2 or 5865F2')
                .setRequired(true)
        ),
    async execute(interaction) {
        let code = interaction.options.getString('code');

        code = code.replace('#', '');

        if (!/^[0-9A-Fa-f]{6}$/.test(code)) {
            await interaction.reply({ content: `❌ "${code}" isn't a valid 6-digit hex code. Try something like \`5865F2\`.` });
            return;
        }

        const colorInt = parseInt(code, 16);

        const r = (colorInt >> 16) & 255;
        const g = (colorInt >> 8) & 255;
        const b = colorInt & 255;

        const hexEmbed = new EmbedBuilder()
            .setColor(colorInt)
            .setTitle(`#${code.toUpperCase()}`)
            .setDescription(`**RGB:** ${r}, ${g}, ${b}`)
            .setThumbnail(`https://singlecolorimage.com/get/${code}/200x200`);

        await interaction.reply({ embeds: [hexEmbed] });
    }
};