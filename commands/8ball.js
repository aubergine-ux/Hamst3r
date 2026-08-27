const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const ANSWERS = [
	'Absolutely.',
	'No chance.',
	'The hamster nods.',
	'The hamster looks away.',
	'Signs point to yes.',
	'Not in this economy.',
	'lol no',
	'Yes, but you will regret it.',
	'Ask again when you are sober.',
	'Outlook: cheeks full.',
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Consult the Hamst3r Oracle.')
		.addStringOption((option) =>
			option
				.setName('question')
				.setDescription('What do you want to know?')
				.setRequired(true)
		),

	async execute(interaction) {
		try {
			const question = interaction.options.getString('question');
			const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];

			await interaction.reply(`> ${question.slice(0, 200)}\n🐹 **${answer}**`);
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