const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setName('purge')
        .setDescription('Elimina mensajes en un canal.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad de mensajes a eliminar (máximo: 100).')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Elimina mensajes únicamente de este usuario.')
                .setRequired(false)),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const usuario = interaction.options.getUser('usuario');

        // Validar que la cantidad esté entre 1 y 100 (Discord limita a 100 mensajes por vez)
        if (cantidad < 1 || cantidad > 100) {
            const invalidAmountEmbed = new EmbedBuilder()
                .setColor("#F87171")
                .setDescription('<:decline:1286772064765743197> La cantidad debe estar entre 1 y 100 mensajes.');
            return interaction.reply({ embeds: [invalidAmountEmbed], ephemeral: true });
        }

        // Obtener los mensajes del canal (hasta el límite de la cantidad indicada)
        const messages = await interaction.channel.messages.fetch({ limit: cantidad });

        let filteredMessages;

        // Filtrar mensajes por usuario si se especificó
        if (usuario) {
            filteredMessages = messages.filter(msg => msg.author.id === usuario.id);
        } else {
            filteredMessages = messages;
        }

        // Convertir la colección filtrada a un array
        const messagesArray = Array.from(filteredMessages.values());

        // Eliminar los mensajes en lotes de hasta 100
        let totalDeleted = 0;

        // Dividir los mensajes en lotes de 100 (Discord no permite más de 100 por vez)
        while (messagesArray.length > 0) {
            const batch = messagesArray.splice(0, 100);
            try {
                const deletedMessages = await interaction.channel.bulkDelete(batch, true); // Eliminar mensajes
                totalDeleted += deletedMessages.size;
            } catch (error) {
                console.error('Error al eliminar los mensajes:', error);
                return interaction.reply({ content: 'Hubo un error al intentar eliminar los mensajes.', ephemeral: true });
            }
        }

        // Respuesta final
        const successEmbed = new EmbedBuilder()
            .setColor("#79E096")
            .setDescription(`<:check:1286772042657566780> Se han eliminado \`${totalDeleted}\` mensajes${usuario ? ` de **${usuario.tag}**` : ''}.`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
