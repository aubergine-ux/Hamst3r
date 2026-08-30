const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Check current Crypto Prices.')
        .addStringOption(option =>
            option.setName('coin')
                .setDescription('Coin to Check')
                .setRequired(true)
                .addChoices(
                    { name: 'Bitcoin (BTC)', value: 'bitcoin' },
                    { name: 'Ethereum (ETH)', value: 'ethereum' },
                    { name: 'Solana (SOL)', value: 'solana' },
                    { name: 'XRP', value: 'xrp' },
                    { name: 'Monero (XMR)', value: 'monero' },
                    { name: 'Hyperliquid (HYPE)', value: 'hyperliquid' },
                    { name: 'Cardano (ADA)', value: 'cardano' }
                )
        ),
    async execute(interaction) {
        const coin = interaction.options.getString('coin');

        await interaction.deferReply();

        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`);

            if (!response.ok) throw new Error ('API Response Error');

            const data = await response.json();

            const coinData = data[coin];
            const price = coinData.usd;
            const change24h = coinData.usd_24h_change;

            const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
            const formattedChange = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
            const directionEmoji = change24h >= 0 ? '🟢' : '🔴';

            const capitalizedCoin = coin.charAt(0).toUpperCase() + coin.slice(1);

            await interaction.editReply({
                content: `🪙 **${capitalizedCoin} Market Update** 🪙\n\n` +
                         `**Price:** \`${formattedPrice}\`\n` +
                         `**24h Change:** ${directionEmoji} \`${formattedChange}\``
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ Failed to fetch Crypto data. The API might be rate-limited right now. Please try again later!'
            });
        }
    }
};