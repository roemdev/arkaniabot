const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Responde a tus preguntas con respuestas al azar.')
        .addStringOption(option => 
            option.setName('pregunta')
                .setDescription('Haz una pregunta al 8ball.')
                .setRequired(true)),
    async execute(interaction) {
        const responses = [
            "Sí", "No", "Tal vez", "Definitivamente",
            "Definitivamente no", "Probablemente", "No cuentes con ello",
            "Es seguro", "Muy dudoso"
        ];

        const pregunta = interaction.options.getString('pregunta');

        // Obtener una respuesta aleatoria
        const response = responses[Math.floor(Math.random() * responses.length)];

        // Construir el embed usando EmbedBuilder
        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle(' ')
            .setDescription(`### ${pregunta}\n🎱 ${response}`)

        // Responder con el embed
        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
};
