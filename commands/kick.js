const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a User from the Server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User you want to Kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the Kick')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser= interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No Reason Provided';
        
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return await interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
        }
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({ content: 'No Permission to use this Command.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({ content: 'Grant me Permission to Kick Users.', ephemeral: true });
        }

        if (!targetMember.kickable) {
            return await interaction.reply({ content: 'Cannot Kick this user. They have a higher role than me.', ephemeral: true });
        }

        try {
            await targetMember.kick(reason);
            await interaction.reply({ content: `Successfully kicked **${targetUser.tag}** for: *${reason}*` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to kick this user.', ephemeral: true });
        }
    }
};