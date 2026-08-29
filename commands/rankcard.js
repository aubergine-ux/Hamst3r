const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { statements } = require('../lib/db');

const HEX_RE = /^#?[0-9a-f]{6}$/i;
const MAX_BYTES = 8 * 1024 * 1024;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rankcard')
		.setDescription('Customise your rank card.')
		.addStringOption((option) =>
			option
				.setName('accent')
				.setDescription('Hex colour for the bar and ring, e.g. #d9a066')
				.setRequired(false)
		)
		.addAttachmentOption((option) =>
			option
				.setName('background')
				.setDescription('Background image')
				.setRequired(false)
		)
		.addBooleanOption((option) =>
			option
				.setName('reset')
				.setDescription('Put everything back to default')
				.setRequired(false)
		),

	async execute(interaction) {
		try {
			const accent = interaction.options.getString('accent');
			const background = interaction.options.getAttachment('background');
			const reset = interaction.options.getBoolean('reset');

			if (reset) {
				statements.clearCard.run(interaction.user.id);

				return interaction.reply({
					content: 'Rank card reset to default.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (!accent && !background) {
				return interaction.reply({
					content: 'Give me an accent colour, a background, or reset: true.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (accent && !HEX_RE.test(accent.trim())) {
				return interaction.reply({
					content: 'Accent must be a 6-digit hex colour, like #d9a066.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (background) {
				if (!background.contentType?.startsWith('image/')) {
					return interaction.reply({
						content: 'The background has to be an image.',
						flags: MessageFlags.Ephemeral,
					});
				}

				if (background.size > MAX_BYTES) {
					return interaction.reply({
						content: 'Background is too big. Keep it under 8 MB.',
						flags: MessageFlags.Ephemeral,
					});
				}
			}

			const normalised = accent
				? (accent.trim().startsWith('#') ? accent.trim() : `#${accent.trim()}`)
				: null;

			statements.setCard.run({
				user_id: interaction.user.id,
				accent: normalised,
				background: background?.url ?? null,
			});

			await interaction.reply({
				content: 'Rank card updated. Run /rank to see it.',
				flags: MessageFlags.Ephemeral,
			});
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
