const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('normas')
        .setDescription('Envía las normas de Arkania.'),
    async execute(interaction) {
        // Embed
        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle('Roles en Arkania')
            .setDescription('* :one: Sé respetuoso y amable con todos los miembros.\n* :two: Evita discusiones políticas o religiosas.\n* :three: No compartas contenido inapropiado, NSFW o spam.\n* :four: Respeta las decisiones de los moderadores.\n* :five: Mantén conversaciones en los canales correspondientes.\n* :six: No toleramos el acoso o la discriminación de ningún tipo.\n* :seven: Usa un lenguaje apropiado y evita insultos.\n* :eight: No compartas información personal de otros sin su consentimiento.\n* :nine: Respeta las reglas establecidas por Discord.\n* :keycap_ten: ¡Diviértete y sé parte de nuestra comunidad!')
        
        // Respuesta
        await interaction.reply({ embeds: [embed], ephemeral: false })
            .catch(err => console.error('Error al enviar el comando /normas:', err));
    },
};
