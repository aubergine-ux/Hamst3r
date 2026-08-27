require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsDir = path.join(__dirname, 'commands');

const commandFiles = fs
  .readdirSync(commandsDir)
  .filter((f) => f.endsWith('.js') && !f.startsWith('_'));

for (const file of commandFiles) {
  const command = require(path.join(commandsDir, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(`Registered ${commands.length} commands.`);
  } catch (err) {
    console.error(err);
  }
})();
