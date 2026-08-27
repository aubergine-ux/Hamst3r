const { SlashCommandBuilder, PermissionFlagBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Change a User\'s Nickname')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User you want to change Nickname of')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('New Nickname')
                .setRequired(true)
        ),

       async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        let newNick = interaction.options.getString('nickname');

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!targetMember) {
                return await interaction.reply({ content: 'User is not in the Server.', ephemeral: true });
            }

            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return await interaction.reply({ content: 'Do not have Permission to change Nicknames.', ephemeral: true });
            }

            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return await interaction.reply({ content: 'Grant me Permission to Manage Nicknames.', ephemeral: true });
            }

            if (targetMember.id === interaction.guild.ownerId) {
                return await interaction.reply({ content: 'Cannot change the Nickname of Server Owner.', ephemeral: true });
            }

            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return await interaction.reply({ content: 'Cannot change this User\'s Nickname. They have a role equal to or higher than mine.', ephemeral: true });
            }

            if (newNick.toLowerCase() === 'reset') {
                newNick = null; 
            }

            try {
                await targetMember.setNickname(newNick);
                
                if (newNick === null) {
                    await interaction.reply({ content: `Successfully reset the Nickname for **${targetUser.tag}**.` });
                } else {
                    await interaction.reply({ content: `Successfully changed **${targetUser.tag}**'s Nickname to **${newNick}**.` });
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error trying to change this User\'s Nickname.', ephemeral: true });
            }
    }
};