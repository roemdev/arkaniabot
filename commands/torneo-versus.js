const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('torneo-versus')
        .setDescription('Genera una lista completa de enfrentamientos y asigna jugadores a Zaun y Piltóver.')
        .addStringOption(option =>
            option.setName('nombres')
                .setDescription('Lista de nombres separados por espacio.')
                .setRequired(true)),
    async execute(interaction) {
        const nombresInput = interaction.options.getString('nombres');
        const nombres = nombresInput.split(' ');

        // Validar que haya al menos dos nombres
        if (nombres.length < 2) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171') // Rojo para errores
                        .setDescription('❌ Debes proporcionar al menos dos nombres para generar enfrentamientos.')
                ],
                ephemeral: true
            });
        }

        // Mezclar nombres para asignación aleatoria
        const shuffledNombres = nombres.sort(() => Math.random() - 0.5);

        // Dividir en dos equipos
        const mitad = Math.ceil(shuffledNombres.length / 2);
        const equipoZaun = shuffledNombres.slice(0, mitad);
        const equipoPiltover = shuffledNombres.slice(mitad);

        // Generar enfrentamientos
        const enfrentamientos = [];
        const maxEnfrentamientos = Math.min(equipoZaun.length, equipoPiltover.length);

        for (let i = 0; i < maxEnfrentamientos; i++) {
            enfrentamientos.push(
                `**${equipoZaun[i]}** (Zaun) 🆚 **${equipoPiltover[i]}** (Piltóver)`
            );
        }

        // Crear fields para los equipos
        const zaunField = equipoZaun.map((jugador, index) => `${index + 1}. ${jugador}`).join('\n');
        const piltoverField = equipoPiltover.map((jugador, index) => `${index + 1}. ${jugador}`).join('\n');

        // Crear embed
        const embed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle('FASE SUIZA - RONDA 1 - TORNEO ARKANIA RIFT')
            .setDescription('A continuación los enfrentamientos de la Semana 1.')
            .addFields(
                { name: " ", value: "**GLOBAL SCORE `0 - 0`**" },
                { name: 'Zaun', value: zaunField || 'Sin jugadores', inline: true },
                { name: "🏆", value: "🆚\n🆚\n🆚\n🆚\n🆚", inline: true },
                { name: 'Piltóver', value: piltoverField || 'Sin jugadores', inline: true }
            )
            .setImage("https://i.imgur.com/cUq8oRq.png")
            .setFooter({ text: '¡Que comiencen el torneo!' });

        // Responder con el embed
        await interaction.reply({ embeds: [embed] });
    },
};
