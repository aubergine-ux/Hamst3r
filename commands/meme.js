const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const TEMPLATE_DIR = path.join(__dirname, '..', 'assets', 'templates');
const FONT_PATH = path.join(__dirname, '..', 'assets', 'impact.ttf');
const IMAGE_RE = /\.(jpe?g|png)$/i;

let FONT_FAMILY = 'sans-serif';
if (fs.existsSync(FONT_PATH)) {
	GlobalFonts.registerFromPath(FONT_PATH, 'Impact');
	FONT_FAMILY = 'Impact';
}

function loadTemplates() {
	if (!fs.existsSync(TEMPLATE_DIR)) return [];

	return fs
		.readdirSync(TEMPLATE_DIR)
		.filter((file) => IMAGE_RE.test(file))
		.map((file) => ({
			name: path.parse(file).name.replace(/[-_]/g, ' '),
			file: path.join(TEMPLATE_DIR, file),
		}));
}

const TEMPLATES = loadTemplates();

function wrapText(ctx, text, maxWidth) {
	const words = text.split(/\s+/);
	const lines = [];
	let line = '';

	for (const word of words) {
		const attempt = line ? `${line} ${word}` : word;

		if (ctx.measureText(attempt).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else {
			line = attempt;
		}
	}

	if (line) lines.push(line);
	return lines;
}

function drawBlock(ctx, text, width, edgeY, fontSize, direction) {
	const lines = wrapText(ctx, text.toUpperCase(), width * 0.92);
	const lineHeight = fontSize * 1.1;
	const ordered = direction === 'up' ? [...lines].reverse() : lines;

	ordered.forEach((line, i) => {
		const y = direction === 'up' ? edgeY - i * lineHeight : edgeY + i * lineHeight;

		ctx.strokeText(line, width / 2, y);
		ctx.fillText(line, width / 2, y);
	});
}

async function renderMeme(templateFile, top, bottom) {
	const image = await loadImage(templateFile);
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');

	ctx.drawImage(image, 0, 0);

	const fontSize = Math.max(20, Math.round(image.height / 9));

	ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
	ctx.textAlign = 'center';
	ctx.fillStyle = '#ffffff';
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = Math.max(2, fontSize / 12);
	ctx.lineJoin = 'round';

	if (top) {
		ctx.textBaseline = 'top';
		drawBlock(ctx, top, canvas.width, fontSize * 0.15, fontSize, 'down');
	}

	if (bottom) {
		ctx.textBaseline = 'bottom';
		drawBlock(ctx, bottom, canvas.width, canvas.height - fontSize * 0.15, fontSize, 'up');
	}

	return canvas.encode('png');
}

module.exports = {
	TEMPLATES,
	renderMeme,

	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Make a meme!')
		.addStringOption((option) =>
			option
				.setName('top')
				.setDescription('Top text')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('bottom')
				.setDescription('Bottom text')
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName('template')
				.setDescription('Template name (random if left blank)')
				.setRequired(false)
		),

	async execute(interaction) {
		try {
			if (!TEMPLATES.length) {
				return interaction.reply({
					content: 'No templates installed. Drop some images in assets/templates.',
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferReply();

			const top = interaction.options.getString('top');
			const bottom = interaction.options.getString('bottom') ?? '';
			const wanted = interaction.options.getString('template');

			let template;

			if (wanted) {
				const needle = wanted.toLowerCase().trim();
				template = TEMPLATES.find((t) => t.name.toLowerCase().includes(needle));

				if (!template) {
					const names = TEMPLATES.map((t) => t.name).join(', ');

					return interaction.editReply(
						`No template matching "${wanted}".\nAvailable: ${names.slice(0, 1800)}`
					);
				}
			} else {
				template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
			}

			const buffer = await renderMeme(template.file, top, bottom);
			const file = new AttachmentBuilder(buffer, { name: 'meme.png' });

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