const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const { statements, levelFromXp } = require('../lib/db');
const { renderRankCard } = require('../lib/rankcard');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Show your rank card.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Whose card to show (yours if blank)')
				.setRequired(false)
		),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const target = interaction.options.getUser('user') ?? interaction.user;

			if (target.bot) {
				return interaction.editReply('Bots do not earn XP.');
			}

			const row = statements.get.get(interaction.guild.id, target.id);

			if (!row) {
				return interaction.editReply(
					target.id === interaction.user.id
						? 'You have no XP here yet. Say something.'
						: `${target.username} has no XP here yet.`
				);
			}

			const { level, into, needed } = levelFromXp(row.xp);
			const { rank } = statements.rank.get(interaction.guild.id, row.xp);
			const card = statements.card.get(target.id);

			const buffer = await renderRankCard({
				username: target.username,
				avatarUrl: target.displayAvatarURL({ extension: 'png', size: 256 }),
				level,
				rank,
				into,
				needed,
				totalXp: row.xp,
				accent: card?.accent,
				background: card?.background,
			});

			const file = new AttachmentBuilder(buffer, { name: 'rank.png' });

			await interaction.editReply({ files: [file] });
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
