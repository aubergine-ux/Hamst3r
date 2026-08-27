const { SlashCommandBuilder, MessageFlags, EmbebBuilder } = require('discord.js');

const SUBS = ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'ProgrammerHumor'];
const IMAGE_RE = /\.(jpe?g|png|gif)$/i;

async function fetchPosts(sub) {
    const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=100&raw_json=1`;
	const res = await fetch(url, {
		headers: { 'User-Agent': 'Hamst3r-Discord-Bot/0.1 (by /u/your_reddit_username)' },
	});

    if (!res.ok) throw new Error(`Reddit responded ${res.status}`);

    const json = await res.json();

    return (json?.data?.children ?? [])
        .map((child) => child.data)
        .filter((post) => post && !post.over_18 && !post.stickied && IMAGE_RE.test(post.url ?? ''));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Grab a fresh meme!')
        .addStringOption((option) =>
            option
                .setName('subreddit')
                .setDescription('Pull from a specific subreddit instead')
                .setRequired(false)
                
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const custom = interaction.options.getString('subreddit');
            const sub = custom
				? custom.replace(/^\/?r\//i, '').trim()
				: SUBS[Math.floor(Math.random() * SUBS.length)];

            let posts;
            try {
                posts = await fetchPosts(sub);
            } catch {
                return interaction.editReply(
					custom
						? `Couldn't reach r/${sub}. Is that a real subreddit?`
						: 'Reddit is not cooperating right now. Try again in a bit.'
				);
            }

            if (!posts.length) {
                return interaction.editReply(`No Usable images found in r/${sub}.`);
            }

            const post = posts[Math.floor(Math.random() * posts.length)];

            const embed = new EmbedBuilder()
				.setColor(0xd9a066)
				.setTitle(post.title.slice(0, 256))
				.setURL(`https://reddit.com${post.permalink}`)
				.setImage(post.url)
				.setFooter({ text: `r/${post.subreddit} • ${post.ups.toLocaleString()} upvotes` });

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