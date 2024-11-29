const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setName('purge')
        .setDescription('Elimina mensajes en un canal.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('max: 1000.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Elimina mensajes únicamente de este usuario.')
                .setRequired(false)),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const usuario = interaction.options.getUser('usuario');

        // Validar rango de cantidad
        if (cantidad < 1 || cantidad > 1000) {
            const invalidAmountEmbed = new EmbedBuilder()
                .setColor("#F87171")
                .setDescription('<:decline:1286772064765743197> La cantidad debe estar entre 1 y 1000 mensajes.');
            return interaction.reply({ embeds: [invalidAmountEmbed], ephemeral: true });
        }

        // Obtener mensajes del canal
        const messages = await interaction.channel.messages.fetch({ limit: Math.min(cantidad, 1000) });
        let filteredMessages;

        // Filtrar mensajes por usuario si se especificó
        if (usuario) {
            filteredMessages = messages.filter(msg => msg.author.id === usuario.id);
        } else {
            filteredMessages = messages;
        }

        // Convertir la colección filtrada a un array
        const messagesArray = Array.from(filteredMessages.values());

        // Eliminar mensajes en bloques de 100 (limitación de Discord)
        let totalDeleted = 0;

        // Dividir los mensajes a eliminar en lotes de 100
        while (messagesArray.length > 0) {
            const batch = messagesArray.splice(0, 100);
            const deletedMessages = await interaction.channel.bulkDelete(batch, true);
            totalDeleted += deletedMessages.size;
        }

        // Respuesta final
        const successEmbed = new EmbedBuilder()
            .setColor("#79E096")
            .setDescription(`<:check:1286772042657566780> Se han eliminado \`${totalDeleted}\` mensajes${usuario ? ` de **${usuario.tag}**` : ''}.`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
