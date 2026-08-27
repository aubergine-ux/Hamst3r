const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Check the status of a Minecraft server.')
        .addStringOption((option) =>
            option.setName('ip').setDescription('The server IP address').setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const ip = interaction.options.getString('ip');

        try {
            const res = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
            const json = await res.json();

            if (!json.players) {
                return interaction.editReply("Can't find the server!");
            }

            const embed = new EmbedBuilder()
                .setTitle(`${ip}`)
                .setThumbnail(`https://eu.mc-api.net/v3/server/favicon/${ip}`)
                .addFields(
                    { name: '🟢┇Online', value: `${json.online}`, inline: true },
                    { name: '🏷️┇Version', value: `${json.version}`, inline: true },
                    { name: '👤┇Players online', value: `${json.players.online}/${json.players.max}`, inline: true },
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error fetching the server status!');
        }
    },
};