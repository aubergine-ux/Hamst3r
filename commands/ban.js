const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a User from the Server')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('User you want to Ban')
            .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the Ban')
                .setRequired(false)
        ),

    async execute(interaction) {

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No Reason Provided';

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: 'No Permission to use this Command.', ephemeral: true });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: 'Grand me Permission to Ban Users.', ephemeral: true });
        }

        if (targetMember) {
        if (!targetMember.bannable) {
            return await interaction.reply({ content: 'Cannot Ban this user. They have a higher role than me.', ephemeral: true });
        }
    }

        try {
            await interaction.guild.members.ban(targetUser.id, { reason: reason });
            await interaction.reply({ content: `Successfully banned **${targetUser.tag}** for: *${reason}*` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to ban this user.', ephemeral: true });
        }
    }
};