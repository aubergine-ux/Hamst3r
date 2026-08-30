# Hamst3r <img width="2000" height="520" alt="lockup-horizontal-light-2000" src="https://github.com/user-attachments/assets/29d7e4c4-9a5c-4206-862a-8403a0a46f99" />




![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![GitHub last commit](https://img.shields.io/github/last-commit/aubergine-ux/Hamst3r?style=for-the-badge)

A meme bot for Discord, built with [Discord.js](https://discord.js.org/).

🌐 **Website:** [Coming Soon]

📨 **Invite Hamst3r:** [Add to your server](https://discord.com/oauth2/authorize?client_id=1542538772124672122&permissions=117760&scope=bot%20applications.commands)

<table align="center">
  <tr>
    <td><img src="" height="200" alt="Command 1" /></td>
    <td><img src="" height="200" alt="Command 2" /></td>
  </tr>
</table>

---

## Commands

### Memes

| Command | Description |
| --- | --- |
| `/meme <top> [bottom] [template]` | Caption a meme template. Picks one at random if you don't name it. |
| `/templates` | List every template Hamst3r knows. |
| `/deepfry <image> [level]` | Ruin an image, respectfully. Level 1–5. |

### Leveling

| Command | Description |
| --- | --- |
| `/rank [user]` | Show a rank card with level, rank, and XP progress. |
| `/leaderboard` | Top 10 members by XP in this server. |
| `/rankcard [accent] [background] [reset]` | Customise your rank card's colour and background. |

### Fun

| Command | Description |
| --- | --- |
| `/8ball <question>` | Consult the Hamst3r Oracle. |
| `/catfact` | A random cat fact. |
| `/coinflip` | Heads or tails. |
| `/roll [dice]` | Roll dice. |
| `/ship <first> <second>` | Calculate compatibility between two people. |
| `/gif <search>` | Search for a GIF. |
| `/meow` | Meow. |
| `/mrrp` | Mrrp. |
| `/steal <emoji>` | Steal an emoji from another server. |

### Moderation

| Command | Description |
| --- | --- |
| `/ban <user> [reason]` | Ban a member. |
| `/kick <user> [reason]` | Kick a member. |
| `/purge <amount>` | Bulk-delete recent messages. |
| `/slowmode <seconds>` | Set channel slowmode. |
| `/nickname <user> <name>` | Change a member's nickname. |
| `/announce <message>` | Post an announcement to a channel. |
| `/echo <message>` | Make Hamst3r say something. |

### Minecraft

| Command | Description |
| --- | --- |
| `/mcstatus <server>` | Check a Minecraft server's status. |
| `/mcskin <username>` | Look up a player's skin. |

### Utility

| Command | Description |
| --- | --- |
| `/avatar [user]` | Show a user's avatar in full size. |
| `/info` | Information about Hamst3r. |
| `/poll <question> [options]` | Start a poll. |
| `/hex <colour>` | Preview a hex colour. |
| `/crypto <coin>` | Current cryptocurrency price. |
| `/aubergine` | Link to the developer's page. |
| `/ping` | Check if the hamster is awake. |

---

## Leveling

Members earn 15–25 XP per message, capped at one award per minute so spam
doesn't inflate the leaderboard. XP is tracked per server. Grinding in one
server doesn't carry over to another.

Progress is stored in a local SQLite database (`hamst3r.db`), created
automatically on first run.

Rank cards are generated with [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas).
Users can set an accent colour and a background image with `/rankcard`, or
put things back with `/rankcard reset: true`.

---

## Roadmap

- **Memes** - `meme` for fresh posts, `caption` for Impact-text overlays, `deepfry` for ruining images respectfully
- **Templates** - pick a format (drakeposting, distracted boyfriend) and fill in the text zones
- **Fun** - `ship`, `coinflip`, `roll`, etc...
- **Hamster** - mascot commands

---

## Self Hosting

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A bot application from the [Discord Developer Portal](https://discord.com/developers/applications)

### Steps

1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and fill in your token, client ID, and a test server ID
3. Run `npm run deploy` to register slash commands
4. Start the bot with `npm start` (or `npm run dev` for auto-restart on save)

### Environment variables

| Variable | Where to find it |
| --- | --- |
| `DISCORD_TOKEN` | Developer Portal → Bot → Reset Token |
| `CLIENT_ID` | Developer Portal → General Information → Application ID |
| `GUILD_ID` | Right-click your test server → Copy Server ID (needs Developer Mode) |

---

## Adding a command

Copy `commands/_template.js`, rename it, and edit the name, description, and logic. The loader picks up every `.js` file in `commands/` automatically — files starting with `_` are skipped.

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Does a thing'),

  async execute(interaction) {
    await interaction.reply('thing done');
  },
};
```

Re-run `npm run deploy` after adding a command or changing its name, description, or options. Edits inside `execute` are picked up by `npm run dev` on save.

---

## Notes

Hamst3r uses slash commands only, so it needs no privileged intents.

Commands register to a single guild by default for instant updates. To publish globally, swap `applicationGuildCommands` for `applicationCommands` in `deploy-commands.js` and drop the `GUILD_ID` argument. Global registration can take up to an hour to propagate.
