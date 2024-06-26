const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ppt')
        .setDescription('Juega piedra, papel o tijera contra el bot.')
        .addStringOption(option =>
            option.setName('eleccion')
                .setDescription('Elige piedra, papel o tijera.')
                .setRequired(true)),
    async execute(interaction) {
        const choices = ['piedra', 'papel', 'tijera'];
        const playerChoice = interaction.options.getString('eleccion').toLowerCase();

        if (!choices.includes(playerChoice)) {
            return interaction.reply('Opción no válida. Debes elegir entre piedra, papel o tijera.');
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result;
        if (playerChoice === botChoice) {
            result = '¡Es un empate!';
        } else if (
            (playerChoice === 'piedra' && botChoice === 'tijera') ||
            (playerChoice === 'papel' && botChoice === 'piedra') ||
            (playerChoice === 'tijera' && botChoice === 'papel')
        ) {
            result = '¡Ganaste! 🎉';
        } else {
            result = '¡Gané yo! 😎';
        }

        let emoji = '';
        if (playerChoice === 'piedra') {
            emoji = '🪨';
        } else if (playerChoice === 'papel') {
            emoji = '📄';
        } else {
            emoji = '✂️';
        }

        let botEmoji = '';
        if (botChoice === 'piedra') {
            botEmoji = '🪨';
        } else if (botChoice === 'papel') {
            botEmoji = '📄';
        } else {
            botEmoji = '✂️';
        }

        // Embed
        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle('Piedra, Papel o Tijera')
            .setDescription(`**Elegiste:** ${playerChoice} ${emoji}\n**Yo elegí:** ${botChoice} ${botEmoji}\n## ${result}`);

        // Respuesta
        await interaction.reply({ embeds: [embed], ephemeral: false })
            .catch(err => console.error('Error al enviar el comando /ppt:', err));
    },
};
