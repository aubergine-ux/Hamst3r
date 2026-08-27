const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Add an Emoji from another Server to this one.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The custom Emoji to steal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Optional new name for the Emoji')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),

    async execute(interaction) {
        const input = interaction.options.getString('emoji');

        const match = input.match(/<(a?):(\w+):(\d+)>/);

        if (!match) {
            await interaction.reply({ content: '❌ That doesn\'t look like a custom Emoji. Paste one from another server.' });
            return;
        }

        const animated = match[1] === 'a';
        const defaultName = match[2];
        const emojiId = match[3];

        const name = interaction.options.getString('name') || defaultName;
        const extension = animated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;

        await interaction.deferReply();

        try {
            const created = await interaction.guild.emojis.create({ attachment: url, name: name });

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Emoji Added')
                .setDescription(`Added **:${created.name}:** to the Server.`)
                .setThumbnail(url);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Couldn\'t add that Emoji. The Server may be out of Emoji slots, or I\'m missing permissions.' });
        }
    }
};