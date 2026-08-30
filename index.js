require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');
const { statements } = require('./lib/db');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs
	.readdirSync(commandsDir)
	.filter((f) => f.endsWith('.js') && !f.startsWith('_'));

for (const file of commandFiles) {
	const command = require(path.join(commandsDir, file));
	client.commands.set(command.data.name, command);
}

client.once('clientReady', () => {
	console.log(`Logged in as ${client.user.tag} — ${client.commands.size} commands`);

	client.user.setPresence({
		activities: [{ name: 'hamst3r', type: ActivityType.Custom, state: '🐹 nom nom nom' }],
		status: 'online',
	});
});

// --- XP tracking ---
const XP_COOLDOWN_MS = 60 * 1000;
const XP_MIN = 15;
const XP_MAX = 25;

client.on('messageCreate', (message) => {
	if (message.author.bot) return;
	if (!message.guild) return;

	try {
		const now = Date.now();
		const existing = statements.get.get(message.guild.id, message.author.id);

		// One award per minute, so spam doesn't inflate the leaderboard.
		if (existing && now - existing.last_award < XP_COOLDOWN_MS) return;

		const xp = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;

		statements.upsert.run({
			guild_id: message.guild.id,
			user_id: message.author.id,
			xp,
			now,
		});
	} catch (error) {
		console.error('[xp] failed to award:', error);
	}
});

// --- Slash commands ---
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	const time = new Date().toISOString().slice(11, 19);
	const where = interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM';
	const args = interaction.options.data
		.map((opt) => `${opt.name}: ${opt.value}`)
		.join(', ');

	console.log(
		`[${time}] /${interaction.commandName}${args ? ` (${args})` : ''} ` +
			`— ${interaction.user.username} (${interaction.user.id}) in ${where}`
	);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`Unhandled error in /${interaction.commandName}:`, error);

		const payload = { content: 'Something broke.', flags: MessageFlags.Ephemeral };
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(payload).catch(() => {});
		} else {
			await interaction.reply(payload).catch(() => {});
		}
	}
});

process.on('unhandledRejection', (error) => console.error('[unhandled]', error));

client.login(process.env.DISCORD_TOKEN);