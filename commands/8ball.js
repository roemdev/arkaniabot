const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const responses = ["Sí", "No", "Tal vez", "Definitivamente", "Definitivamente no", "Probablemente", "No cuentes con ello", "Es seguro", "Muy dudoso"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Responde a tus preguntas con respuestas al azar.'),
    async execute(interaction) {

        const response = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle(' ')
            .setDescription(response)
        
        await interaction.reply({ embeds: [embed] })
    }
}