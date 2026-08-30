const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get info about a user or a server!')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setDescription('Info about a user')
                .addUserOption((option) =>
                    option.setName('target').setDescription('The user')
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('server').setDescription('Info about the server')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target') ?? interaction.user;
            await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);

        } else if (interaction.options.getSubcommand() === 'server') {
            await interaction.reply(`Server: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`);
        }
    },
};

// This Part was done by CLAUDE, sorry!