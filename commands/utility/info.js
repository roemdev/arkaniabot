const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Comandos informativos.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('avatar')
				.setDescription('Muestra el avatar de un usuario.')
				.addUserOption(option =>
					option
						.setName('usuario')
						.setDescription('El usuario del que quieres ver el avatar.')
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('userinfo')
				.setDescription('Muestra información sobre un usuario.')
				.addUserOption(option =>
					option
						.setName('usuario')
						.setDescription('El usuario del que quieres ver la información.')
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('serverinfo')
				.setDescription('Muestra información sobre el servidor.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ping')
				.setDescription('Muestra la latencia del bot.')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    	.setDMPermission(false),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'avatar') {
			const user = interaction.options.getUser('usuario') || interaction.user;

			const avatarEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${user.tag}'s Avatar`)
				.setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
				.setTimestamp();

			await interaction.reply({ embeds: [avatarEmbed], ephemeral: true });
		} else if (subcommand === 'userinfo') {
			const user = interaction.options.getUser('usuario') || interaction.user;

			const userInfoEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${user.tag}'s Information`)
				.addFields(
					{ name: 'Username', value: user.username, inline: true },
					{ name: 'Discriminator', value: `#${user.discriminator}`, inline: true },
					{ name: 'ID', value: user.id },
					{ name: 'Bot?', value: user.bot ? 'Yes' : 'No', inline: true },
					{ name: 'Created At', value: user.createdAt.toLocaleDateString('en-US'), inline: true }
				)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setTimestamp();

			await interaction.reply({ embeds: [userInfoEmbed], ephemeral: true });
		} else if (subcommand === 'serverinfo') {
			const guild = interaction.guild;

			const serverInfoEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${guild.name}'s Information`)
				.addFields(
					{ name: 'Name', value: guild.name, inline: true },
					{ name: 'ID', value: guild.id, inline: true },
					{ name: 'Owner', value: guild.owner.user.tag, inline: true },
					{ name: 'Region', value: guild.region.toUpperCase(), inline: true },
					{ name: 'Members', value: guild.memberCount.toString(), inline: true },
					{ name: 'Created At', value: guild.createdAt.toLocaleDateString('en-US'), inline: true }
				)
				.setThumbnail(guild.iconURL({ dynamic: true }))
				.setTimestamp();

			await interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
		} else if (subcommand === 'ping') {
			const botLatency = Date.now() - interaction.createdTimestamp;
			const apiLatency = Math.round(interaction.client.ws.ping);

			const pingEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Pong! :ping_pong:')
				.addFields(
					{ name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
					{ name: 'API Latency', value: `${apiLatency}ms`, inline: true }
				)
				.setTimestamp();

			await interaction.reply({ embeds: [pingEmbed], ephemeral: true });
		}
	},
};
