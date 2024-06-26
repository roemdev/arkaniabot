const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ppt')
        .setDescription('Juega piedra, papel o tijera contra el bot.')
        .addStringOption(option =>
            option.setName('eleccion')
                .setDescription('Elige piedra, papel o tijera.')
                .setRequired(true)
                .addChoices([
                    { name: 'Piedra 🪨', value: 'piedra' },
                    { name: 'Papel 📄', value: 'papel' },
                    { name: 'Tijera ✂️', value: 'tijera' }
                ])),
    async execute(interaction) {
        const choices = ['piedra', 'papel', 'tijera'];
        const playerChoice = interaction.options.getString('eleccion').toLowerCase();

        // Verificar si la elección del jugador es válida
        if (!choices.includes(playerChoice)) {
            return interaction.reply('Opción no válida. Debes elegir entre piedra, papel o tijera.');
        }

        // Elección aleatoria del bot
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        // Determinar el resultado del juego
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

        // Mapa de emojis para las opciones
        const emojiMap = {
            'piedra': '🪨',
            'papel': '📄',
            'tijera': '✂️'
        };

        // Obtener emojis para mostrar en el embed
        const emojiPlayer = emojiMap[playerChoice];
        const emojiBot = emojiMap[botChoice];

        // Embed con el resultado del juego
        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle('Piedra, Papel o Tijera')
            .setDescription(`**Elegiste:** ${playerChoice} ${emojiPlayer}\n**Yo elegí:** ${botChoice} ${emojiBot}\n## ${result}`);

        // Enviar la respuesta con el embed
        await interaction.reply({ embeds: [embed] });
    },
};
