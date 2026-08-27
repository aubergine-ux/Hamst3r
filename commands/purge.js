const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages at once.')
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-50)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(50)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);

        if (!botPermissions.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory])) {
            return interaction.reply({
                content: 'I don\'t have permission to delete messages in this channel. I need **Manage Messages** and **Read Message History**.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({
            content: `Successfully deleted ${deleted.size} messages!`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
