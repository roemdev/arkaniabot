const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	async execute(interaction) {
		// Medir el tiempo antes de enviar la respuesta
		const botLatency = Date.now() - interaction.createdTimestamp;
		const apiLatency = Math.round(interaction.client.ws.ping);

		// Crear el embed
		const embed = new EmbedBuilder()
			.setColor('NotQuiteBlack')
			.setTitle('Pong! :ping_pong:')
			.addFields(
				{ name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
				{ name: 'API Latency', value: `${apiLatency}ms`, inline: true }
			)
			.setTimestamp();

		// Enviar el embed como respuesta
		await interaction.reply({ embeds: [embed] });
	},
};
