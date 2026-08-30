const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a Yes/No Poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll Question')
                .setRequired(true)
        ),
    async execute(interaction) {
        const question = interaction.options.getString('question');

        const pollEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📊 New Poll')
            .setDescription(question)
            .setFooter({ text: `Poll by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({embeds: [pollEmbed] });

        const me = interaction.guild?.members.me;
        const botPermissions = me && interaction.channel.permissionsFor(me);
        const required = [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory];

        if (botPermissions && !botPermissions.has(required)) {
            return interaction.followUp({
                content: 'I posted the poll, but I need **Add Reactions** and **Read Message History** in this channel to add the 👍/👎 options.',
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            const pollMessage = await interaction.fetchReply();

            await pollMessage.react('👍');
            await pollMessage.react('👎');
        } catch (error) {
            console.error('Failed to add poll reactions:', error.message);
            await interaction.followUp({
                content: 'I posted the poll, but couldn\'t add the 👍/👎 reactions. Check my permissions in this channel.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
};