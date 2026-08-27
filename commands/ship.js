const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Check Compatibiliyu between 2 Users')
        .addUserOption(option =>
            option.setName('target1')
                .setDescription('First Person')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('target2')
                .setDescription('Second Person')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user1 = interaction.options.getUser('target1');
        const user2 = interaction.options.getUser('target2');

        const lovePercentage = Math.floor(Math.random() * 101);

        const firstHalf = user1.username.substring(0, Math.ceil(user1.username.length / 2));
        const secondHalf = user2.username.substring(Math.floor(user2.username.length / 2));
        
        const shipName = (firstHalf + secondHalf).toLowerCase();
        const finalShipName = shipName.charAt(0).toUpperCase() + shipName.slice(1);

        let reaction = '';
        let emoji = '😐';

        if (lovePercentage >= 90) {
            reaction = "A match made in heaven! Absolute Soulmates. 💖";
            emoji = '❤️‍🔥';
        } else if (lovePercentage >= 70) {
            reaction = "There is definitely a Spark ✨";
            emoji = '❤️';
        } else if (lovePercentage >= 40) {
            reaction = "Could work with some effort! 🤔";
            emoji = '💛';
        } else if (lovePercentage >= 15) {
            reaction = "Best to keep it in the friendzone. 🥶";
            emoji = '💔';
        } else {
            reaction = "Total disaster.... Stay away from each other! ☣️";
            emoji = '❌';
        }

        await interaction.reply({
        content: `**Matchmaking Results**\n` +
                 `**${user1.username}** x **${user2.username}**\n\n` +
                 `**Ship Name:** \`${finalShipName}\`\n` +
                 `**Compatibility:** ${lovePercentage}% ${emoji}\n\n` +
                 `*${reaction}*`
        });
    }
}