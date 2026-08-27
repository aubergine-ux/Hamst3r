const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { TEMPLATES } = require('./meme');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('templates')
		.setDescription('List every meme template Hamst3r knows.'),

	async execute(interaction) {
		try {
			if (!TEMPLATES.length) {
				return interaction.reply({
					content: 'No templates installed yet.',
					flags: MessageFlags.Ephemeral,
				});
			}

			const names = TEMPLATES.map((t) => t.name).sort();
			const list = names.map((name) => `\`${name}\``).join(' · ');

			const embed = new EmbedBuilder()
				.setColor(0xd9a066)
				.setTitle(`🐹 ${names.length} templates`)
				.setDescription(list.slice(0, 4096))
				.setFooter({ text: 'Use /meme template: <name> — partial names work' });

			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(`Error executing /${interaction.commandName}:`, error);

			const payload = {
				content: 'There was an error running that command.',
				flags: MessageFlags.Ephemeral,
			};

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(payload).catch(() => {});
			} else {
				await interaction.reply(payload).catch(() => {});
			}
		}
	},
};