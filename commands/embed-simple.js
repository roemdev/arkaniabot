const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setName('embed-simple')
        .setDescription('Envía un embed editable vacío en el canal actual.'),
    async execute(interaction) {

        // Crear un embed vacío con el color NotQuiteBlack
        const embed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle('Título del Embed')
            .setDescription('Descripción del Embed.')
            .setFooter({ text: 'Edita este embed según sea necesario.' });

        // Enviar el embed al canal
        await interaction.channel.send({ embeds: [embed] });

        // Responder de forma efímera con un embed positivo
        const confirmationEmbed = new EmbedBuilder()
            .setColor("#79E096") // Verde predefinido para respuestas positivas
            .setDescription('<:check:1286772042657566780> Embed enviado con éxito.');

        await interaction.reply({ embeds: [confirmationEmbed], ephemeral: true });
    },
};
