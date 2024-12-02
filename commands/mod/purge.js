const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setName('purge')
        .setDescription('Elimina mensajes en un canal.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (máximo: 1000).')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Elimina mensajes únicamente de este usuario.')
                .setRequired(false)),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const usuario = interaction.options.getUser('usuario');

        // Validar que la cantidad esté entre 1 y 1000
        if (cantidad < 1 || cantidad > 1000) {
            const invalidAmountEmbed = new EmbedBuilder()
                .setColor("#F87171")
                .setDescription('<:deny:1313237501359558809> La cantidad debe estar entre 1 y 1000 mensajes.');
            return interaction.reply({ embeds: [invalidAmountEmbed], ephemeral: true });
        }

        let totalDeleted = 0;
        let lastMessageId;

        while (totalDeleted < cantidad) {
            // Determinar cuántos mensajes buscar en este lote
            const remaining = cantidad - totalDeleted;
            const fetchLimit = remaining > 100 ? 100 : remaining;

            // Obtener mensajes del canal
            const messages = await interaction.channel.messages.fetch({
                limit: fetchLimit,
                ...(lastMessageId && { before: lastMessageId }),
            });

            if (messages.size === 0) break; // Detener si no hay más mensajes

            let filteredMessages;

            // Filtrar mensajes por usuario si se especificó
            if (usuario) {
                filteredMessages = messages.filter(msg => msg.author.id === usuario.id);
            } else {
                filteredMessages = messages;
            }

            // Convertir la colección filtrada a un array
            const messagesArray = Array.from(filteredMessages.values());

            // Eliminar los mensajes del lote
            try {
                const deletedMessages = await interaction.channel.bulkDelete(messagesArray, true);
                totalDeleted += deletedMessages.size;
            } catch (error) {
                console.error('Error al eliminar los mensajes:', error);
                break;
            }

            // Actualizar el ID del último mensaje procesado
            lastMessageId = messages.last()?.id;
        }

        // Respuesta final
        const successEmbed = new EmbedBuilder()
            .setColor("#79E096")
            .setDescription(`<:check:1313237490395648021> Se han eliminado \`${totalDeleted}\` mensajes${usuario ? ` de **${usuario.tag}**` : ''}.`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
