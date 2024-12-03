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
                .setColor("#FFC868")
                .setDescription('<:info:1313237490395648021> La cantidad debe estar entre 1 y 1000 mensajes.');
            return interaction.reply({ embeds: [invalidAmountEmbed], ephemeral: true });
        }

        let messagesToDelete = [];
        let totalMessagesFetched = 0;
        let lastMessageId;

        // Buscar mensajes hasta alcanzar la cantidad deseada
        while (totalMessagesFetched < cantidad) {
            const remaining = cantidad - totalMessagesFetched;
            const fetchLimit = remaining > 100 ? 100 : remaining;

            // Obtener mensajes del canal
            const messages = await interaction.channel.messages.fetch({
                limit: fetchLimit,
                ...(lastMessageId && { before: lastMessageId }),
            });

            if (messages.size === 0) break; // Detener si no hay más mensajes

            // Filtrar mensajes por usuario si se especificó
            let filteredMessages = messages;
            if (usuario) {
                filteredMessages = messages.filter(msg => msg.author.id === usuario.id);
            }

            // Añadir los mensajes filtrados al array
            messagesToDelete = [...messagesToDelete, ...Array.from(filteredMessages.values())];
            totalMessagesFetched += filteredMessages.size;

            // Actualizar el ID del último mensaje procesado
            lastMessageId = messages.last()?.id;
        }

        // Calcular la cantidad real de mensajes que se eliminarán
        const actualAmountToDelete = messagesToDelete.length;

        // Enviar un mensaje informativo regular (no efímero) sobre cuántos mensajes se eliminarán
        const infoEmbed = new EmbedBuilder()
            .setColor("#79E096")
            .setDescription(`<:check:1313237490395648021> Se eliminarán \`${actualAmountToDelete}\` mensajes${usuario ? ` de **${usuario.tag}**` : ''}.`);
        
        const sentMessage = await interaction.reply({ embeds: [infoEmbed], fetchReply: true }); // Obtener el mensaje enviado por el bot

        // Eliminar los mensajes en lotes de 100, excluyendo el mensaje del bot
        let totalDeleted = 0;
        while (messagesToDelete.length > 0) {
            const batch = messagesToDelete.splice(0, 100); // Lotes de 100

            // Filtrar el mensaje enviado por el bot para no eliminarlo
            const filteredBatch = batch.filter(msg => msg.id !== sentMessage.id);

            if (filteredBatch.length > 0) {
                try {
                    await interaction.channel.bulkDelete(filteredBatch, true);
                    totalDeleted += filteredBatch.length;
                } catch (error) {
                    console.error('Error al eliminar los mensajes:', error);
                }
            }
        }
    },
};
