const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const MAX_BYTES = 8 * 1024 * 1024;

function clamp(value) {
    return value < 0 ? 0 : value > 255 ? 255 : value;
}

function fryPixels(ctx, width, height, intensity) {
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;

    const contrast = 1 + intensity * 0.45;
    const saturation = 1 + intensity * 0.7;
    const noise = intensity * 45;

    for (let i = 0; i < data.length; i += 4) {
		let r = data[i];
		let g = data[i + 1];
		let b = data[i + 2];

		r = (r - 128) * contrast + 128;
		g = (g - 128) * contrast + 128;
		b = (b - 128) * contrast + 128;

		const gray = 0.299 * r + 0.587 * g + 0.114 * b;

		r = gray + (r - gray) * saturation;
		g = gray + (g - gray) * saturation;
		b = gray + (b - gray) * saturation;

		r += intensity * 14;

		const grain = (Math.random() - 0.5) * noise;

		data[i] = clamp(r + grain);
		data[i + 1] = clamp(g + grain);
		data[i + 2] = clamp(b + grain);
	}

	ctx.putImageData(image, 0, 0);
}

async function deepfry(buffer, level) {
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

	const quality = Math.max(4, 30 - level * 5);
	const passes = Math.ceil(level / 2);

	for (let pass = 0; pass < passes; pass++) {
		fryPixels(ctx, canvas.width, canvas.height, level / 5);

		const encoded = await canvas.encode('jpeg', quality);
		const reloaded = await loadImage(encoded);

		ctx.drawImage(reloaded, 0, 0, canvas.width, canvas.height);
	}

	return canvas.encode('jpeg', quality);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deepfry')
		.setDescription('Ruin an image, respectfully.')
		.addAttachmentOption((option) =>
			option
				.setName('image')
				.setDescription('The image to fry')
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('level')
				.setDescription('How fried (1-5, default 3)')
				.setMinValue(1)
				.setMaxValue(5)
				.setRequired(false)
		),

	async execute(interaction) {
		try {
			const attachment = interaction.options.getAttachment('image');
			const level = interaction.options.getInteger('level') ?? 3;

			if (!attachment.contentType?.startsWith('image/')) {
				return interaction.reply({
					content: 'That is not an image.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (attachment.size > MAX_BYTES) {
				return interaction.reply({
					content: 'Too big. Keep it under 8 MB.',
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferReply();

			const res = await fetch(attachment.url);

			if (!res.ok) {
				return interaction.editReply('Could not download that image.');
			}

			const source = Buffer.from(await res.arrayBuffer());
			const fried = await deepfry(source, level);
			const file = new AttachmentBuilder(fried, { name: 'deepfried.jpg' });

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