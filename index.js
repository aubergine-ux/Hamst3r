require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, MessageFlags } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load every .js file in ./commands, skipping _underscore files (templates, WIP)
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
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Commands handle their own errors, but this catches anything that slips out.
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
