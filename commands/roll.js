const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lanza un dado virtual con un número especificado de caras, o 6 por defecto.')
        .addIntegerOption(option =>
            option.setName('caras')
                .setDescription('Número de caras del dado.')
                .setRequired(false)),
    async execute(interaction) {
        let sides = 6; // Número de caras por defecto

        // Obtener el número de caras del dado desde la opción, si está proporcionada
        if (interaction.options.getInteger('caras')) {
            sides = interaction.options.getInteger('caras');

            // Validar que el número de caras sea mayor que 0
            if (sides <= 0) {
                return interaction.reply({ content: 'Debes proporcionar un número mayor a 0.', ephemeral: true });
            }
        }

        const rollResult = Math.floor(Math.random() * sides) + 1;

        // Embed
        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle('Resultado')
            .setDescription(`🎲 Has lanzado un dado de **${sides}** caras y ha salido: **${rollResult}**`);

        // Respuesta
        await interaction.reply({ embeds: [embed], ephemeral: false })
            .catch(err => console.error('Error al enviar el comando /roll:', err));
    },
};
