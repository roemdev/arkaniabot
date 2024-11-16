const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('torneo')
        .setDescription('Envía el embed de inscripción al torneo para todos los miembros.'),
    async execute(interaction) {
        // Solo permitimos que el dueño del comando lo ejecute
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('#F87171').setDescription('❌ No tienes permisos para ejecutar este comando.')], ephemeral: true });
        }

        // Embed inicial con los botones de Inscribirse y Funcionamiento
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🏆 ¡Únete al Torneo!')
            .setDescription('Participa en el torneo y muestra tus habilidades.')
            .setFooter({ text: 'Elige una opción a continuación.' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('inscribirme')
                    .setLabel('Inscribirme')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('funcionamiento')
                    .setLabel('Funcionamiento')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        // Listener para los botones
        const filter = (i) => ['inscribirme', 'funcionamiento', 'salir'].includes(i.customId);
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });

        collector.on('collect', async (i) => {
            const filePath = path.join(__dirname, 'inscritos.json');
            let inscritos = [];

            // Leer o crear el archivo JSON de inscritos
            if (fs.existsSync(filePath)) {
                inscritos = JSON.parse(fs.readFileSync(filePath));
            }

            if (i.customId === 'inscribirme') {
                if (!inscritos.includes(i.user.id)) {
                    // Añadir al usuario al archivo JSON si no está inscrito
                    inscritos.push(i.user.id);
                    fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
                    await i.reply({ embeds: [new EmbedBuilder().setColor('#79E096').setDescription('✅ ¡Te has inscrito exitosamente!')], ephemeral: true });
                } else {
                    // Si el usuario ya está inscrito, enviar mensaje efímero con opción de salir
                    const rowSalir = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('salir')
                            .setLabel('Salir del torneo')
                            .setStyle(ButtonStyle.Danger)
                    );
                    await i.reply({ embeds: [new EmbedBuilder().setColor('#F87171').setDescription('❌ Ya estás inscrito en el torneo.')], components: [rowSalir], ephemeral: true });
                }
            } else if (i.customId === 'funcionamiento') {
                // Crear y enviar el embed con la información del torneo
                const funcionamientoEmbed = new EmbedBuilder()
                    .setColor('#FFC868')
                    .setTitle('Información del Torneo')
                    .setDescription('Aquí va la información del torneo.'); // Añadirás los detalles aquí

                await i.reply({ embeds: [funcionamientoEmbed], ephemeral: true });
            } else if (i.customId === 'salir') {
                // Remover al usuario del archivo JSON si desea salir
                inscritos = inscritos.filter(userId => userId !== i.user.id);
                fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
                await i.reply({ embeds: [new EmbedBuilder().setColor('#79E096').setDescription('✅ Has salido del torneo.')], ephemeral: true });
            }
        });

        collector.on('end', () => {
            // Opcional: Puedes desactivar los botones después del tiempo del colector si quieres.
        });
    },
};
