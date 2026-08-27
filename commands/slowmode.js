const { SlashCommandBuilder, PermissionFlagBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set Slowmode Delay')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode Delay in Seconds (0 for off)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(20000)
        ),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return await interaction.reply({ content: 'No Permission to change Channel Settings.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return await interaction.reply({ content: 'Grant me Permission to Manage Channels.', ephemeral: true });
        }

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            if (seconds === 0) {
                await interaction.reply({ content: 'Slowmode has been Disabled for this Channel.' });
            } else {
                await interaction.reply({ content: `Slowmode has been set to **${seconds}** seconds for this Channel.` });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an ERROR UGH OMG UGH trying to set the Slowmode.', ephemeral: true });
        }
    }
};