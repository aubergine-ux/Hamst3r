require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

client.login(process.env.DISCORD_TOKEN);