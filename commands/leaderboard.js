const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { statements, levelFromXp } = require('../lib/db');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Top members by XP in this server.'),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const rows = statements.top.all(interaction.guild.id, 10);

			if (!rows.length) {
				return interaction.editReply('Nobody has earned XP here yet.');
			}

			const lines = [];

			for (const [index, row] of rows.entries()) {
				const { level } = levelFromXp(row.xp);
				const prefix = MEDALS[index] ?? `\`#${index + 1}\``;

				// May be null if the member left the server.
				const member = await interaction.guild.members
					.fetch(row.user_id)
					.catch(() => null);

				const name = member?.user.username ?? 'unknown member';

				lines.push(`${prefix} **${name}** — level ${level} · ${row.xp.toLocaleString()} XP`);
			}

			const embed = new EmbedBuilder()
				.setColor(0xd9a066)
				.setTitle(`🐹 Leaderboard — ${interaction.guild.name}`)
				.setDescription(lines.join('\n'));

			await interaction.editReply({ embeds: [embed] });
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
