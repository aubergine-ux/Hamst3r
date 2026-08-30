const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends an Announcement in the Desired Channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption((option) =>
            option
                .setName('input')
                .setDescription('The input to announce back')
                .setRequired(true)
                .setMaxLength(2_000),
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel to announce into')
                .addChannelTypes(ChannelType.GuildText),
        )
        .addBooleanOption((option) =>
            option
                .setName('embed')
                .setDescription('Whether or not the announcement should be embedded'),
        ),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;
        const embed = interaction.options.getBoolean('embed') ?? false;

        const me = interaction.guild?.members.me;
        const botPermissions = me && channel.permissionsFor(me);
        const required = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];
        if (embed) required.push(PermissionFlagsBits.EmbedLinks);

        if (botPermissions && !botPermissions.has(required)) {
            return interaction.reply({
                content: `I don't have permission to post in ${channel}. I need **View Channel**, **Send Messages**${embed ? ' and **Embed Links**' : ''} there.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            if (embed) {
                await channel.send({ embeds: [{ description: input }] });
            } else {
                await channel.send(input);
            }
        } catch (error) {
            console.error(`Failed to announce in ${channel.id}:`, error.message);
            return interaction.reply({
                content: `I couldn't send that announcement to ${channel}. Check my permissions in that channel.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Acknowledge the interaction if echoing to a different channel
        if (channel.id !== interaction.channel.id) {
            await interaction.reply({ content: `Message sent to ${channel}!`, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'Done!', flags: MessageFlags.Ephemeral });
        }
    },
}