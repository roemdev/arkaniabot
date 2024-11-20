const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
// 1239927731169267763

module.exports = {
    data: new SlashCommandBuilder()
        .setName('torneo')
        .setDescription('Envía el embed de inscripción al torneo para todos los miembros.'),
    async execute(interaction) {
        // Confirmar que el comando fue ejecutado correctamente
        const confirmationEmbed = new EmbedBuilder()
            .setColor('#79E096')
            .setDescription('<:check:1286772042657566780> El comando para el torneo fue enviado con éxito.');

        await interaction.reply({ embeds: [confirmationEmbed], ephemeral: true });

        // Crear el embed para el torneo
        const embed = new EmbedBuilder()
            .setColor('#2f2f2f')
            .setTitle('🏆 ARKANIA RIFT')
            .setDescription('¿Estás listo para enfrentarte a los mejores y demostrar tu supremacía en el Puente del Progreso? Inscríbete ahora y únete a esta épica contienda donde cada jugada cuenta y solo el más fuertes llegará a la cima. ¡No dejes que te lo cuenten, haz historia en ARKANIA RIFT! ¿Tienes lo que se necesita para ganar? **¡Este es tu momento!**')
            .addFields(
                { name: 'Fechas', value: 'Demuestra tu valía del 23 al 14 de diciembre en dos grandes fases de máxima competitivdad.' },
                { name: 'Criterios', value: '¿Zaun o Piltóver? Aplasta a tu rival en el Puente del Progreso ARAM en un `1 VS 1` con un campeón significativo de tu lado.' },
                { name: 'Premios', value: 'Compite en este gran torneo y vive al máximo la experiencia Arcane ganando el **Pase de Batalla de Arcane**.' }
            )
            .setImage(
                'https://cdn.discordapp.com/attachments/1273453941056602152/1308266912484167751/SORTEO_2.png'
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('inscribirme')
                .setLabel('¡Inscríbeme!')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('faq')
                .setLabel('FAQ')
                .setStyle(ButtonStyle.Secondary)
        );

        // Enviar mensaje con embed y botones
        await interaction.channel.send({ embeds: [embed], components: [row] });

        // Crear filtro y recolector
        const filter = (i) => ['inscribirme', 'faq'].includes(i.customId);
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 600000,
        });

        // Manejar interacciones con los botones
        collector.on('collect', async (i) => {
            if (i.customId === 'inscribirme') {
                // Modal para inscripción
                const modal = new ModalBuilder()
                    .setCustomId('modal_inscripcion')
                    .setTitle('Formulario de inscripción')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('nombre_invocador')
                                .setLabel(
                                    'Nombre de invocador (Ej. MataMoscas#7842)'
                                )
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                await i.showModal(modal);
            } else if (i.customId === 'faq') {
                // Embed de FAQ
                const faqEmbed = new EmbedBuilder()
                    .setColor('#FFC868')
                    .setTitle('Preguntas Frecuentes (FAQ)')
                    .setDescription('Respuestas a las preguntas más comunes:')
                    .addFields(
                        {
                            name: '¿Cómo puedo inscribirme al torneo?',
                            value: 'Para inscribirte, simplemente haz clic en el botón "Inscribirme" que aparece al enviar el embed en el canal del torneo. Asegúrate de estar listo para competir en las fechas establecidas.'
                        },
                        {
                            name: '¿Quién puede participar en el torneo?',
                            value: 'Cualquier miembro del servidor.'
                        },
                        {
                            name: '¿Qué pasa si ya estoy inscrito pero quiero salir del torneo?',
                            value: 'Si ya estás inscrito y decides no participar debes enviarle un mensaje a `Jedoth` solciitando esto debido a que las isncripciones se eliminan de manera manual.'
                        },
                        {
                            name: '¿Cómo se jugarán las partidas?',
                            value: 'Las partidas se jugarán en un formato 1 VS 1 en el mapa de Puente del Progreso ARAM, donde deberás elegir un campeón representativo de la facción que te haya tocado ya sea Zaun o Piltover. Las regiones se asignarán de manera aleatoria o de mutuo acuerdo entre los rivales.'
                        },
                        {
                            name: '¿Qué son las dos grandes fases del torneo?',
                            value: 'El torneo se divide en dos fases. Una SUIZA y una ELIMINATORIA.\nFase Suiza: La primera semana los jugadores serán emparejados de manera aleatoria y los mismos deberán de jugar la partida hasta tener un ganador. En la segunda semana y tercera semana se emparejarán a los jugadores que tengan el mismo marcador, ya sea 1 - 0, 0 - 1, 1 - 1, 2 - 0, 0 - 2. (Victorias - Derrotas). De esta manera tomaremos a los cuatro mejores los cuales irán a la segunda fase.\nFase Eliminatoria: Los jugadores se emparejarán de forma aleatoria en un formato de llaves **al mejor de 3**. Esta fase corresponde tanto a la semifinal como a la gran final.'
                        },
                        {
                            name: '¿Cuáles son los premios del torneo?',
                            value: 'El ganador del torneo recibirá el Pase de Batalla de Arcane, que te permitirá disfrutar del contenido exclusivo dentro del universo de Arcane y League of Legends. Y para ambos finalistas (primer y segundo lugar) le otorgaremos el rol <@&1303816942326648884> el más exclusivo del servidor.'
                        },
                        {
                            name: '¿Qué pasa si no puedo jugar en las fechas establecidas?',
                            value: 'Si no puedes participar en alguna de las fechas del torneo, por favor infórmalo lo antes posible para ver si hay opciones de reprogramación, aunque no se garantiza.'
                        },
                        {
                            name: '¿Qué debo hacer si tengo problemas técnicos durante el torneo?',
                            value: 'Si experimentas algún problema técnico, como desconexiones o fallos en el juego, hazlo saber lo antes posible. Dependiendo de la situación, se decidirá si se reprograma la partida o si se toman otras medidas.'
                        },
                        {
                            name: 'Tengo más duddas',
                            value: 'Contacta a Jedoth y si son de interés común las verás aquí en lo adelante.'
                        }
                    );

                await i.reply({ embeds: [faqEmbed], ephemeral: true });
            }
        });

        // Escuchar eventos para el modal de inscripción
        const client = interaction.client;
        if (!client.modalEventRegistered) {
            client.modalEventRegistered = true; // Evitar múltiples registros

            client.on('interactionCreate', async (modalInteraction) => {
                if (
                    !modalInteraction.isModalSubmit() ||
                    modalInteraction.customId !== 'modal_inscripcion'
                )
                    return;

                // Confirmar que los datos fueron enviados correctamente
                const nombreInvocador = modalInteraction.fields.getTextInputValue(
                    'nombre_invocador'
                );

                const confirmationModalEmbed = new EmbedBuilder()
                    .setColor('#79E096')
                    .setDescription(
                        '<:check:1286772042657566780> Tu solicitud de inscripción ha sido enviada correctamente y estará siendo revisada. Te informaré pronto.'
                    );

                await modalInteraction.reply({
                    embeds: [confirmationModalEmbed],
                    ephemeral: true,
                });

                const embedValidacion = new EmbedBuilder()
                    .setColor('#FFC868')
                    .setTitle('Nueva Inscripción')
                    .setDescription('Un usuario ha enviado su solicitud de inscripción al torneo.')
                    .addFields(
                        { name: 'Invocador', value: nombreInvocador, inline: true },
                        { name: 'Discord', value: `<@${modalInteraction.user.id}>`, inline: true }
                    );

                const rowValidacion = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('aprobar')
                        .setLabel('Aprobar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('denegar')
                        .setLabel('Denegar')
                        .setStyle(ButtonStyle.Danger)
                );

                const validacionChannel = await client.channels
                    .fetch('1308660007113330698')
                    .catch(() => null);

                if (!validacionChannel) {
                    return modalInteraction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#F87171')
                                .setDescription(
                                    '<:decline:1286772064765743197> No se pudo enviar tu inscripción para revisión.'
                                ),
                        ],
                        ephemeral: true,
                    });
                }

                const validationMessage = await validacionChannel.send({
                    embeds: [embedValidacion],
                    components: [rowValidacion],
                });

                // Bloquear los botones después de la interacción
                const filter = (i) =>
                    ['aprobar', 'denegar'].includes(i.customId) &&
                    i.message.id === validationMessage.id;
                const collector = validacionChannel.createMessageComponentCollector({
                    filter,
                    time: 600000,
                });

                collector.on('collect', async (i) => {
                    try {
                        // Bloquear botones después de que se presionan
                        await i.update({
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('aprobar')
                                        .setLabel('Aprobado')
                                        .setStyle(ButtonStyle.Success)
                                        .setDisabled(true),
                                    new ButtonBuilder()
                                        .setCustomId('denegar')
                                        .setLabel('Denegado')
                                        .setStyle(ButtonStyle.Danger)
                                        .setDisabled(true)
                                ),
                            ],
                        });

                        if (i.customId === 'aprobar') {
                            // Inscribir al usuario en el JSON
                            const filePath = path.join(__dirname, 'inscritos_torneo.json');
                            let inscritos = [];

                            if (fs.existsSync(filePath)) {
                                inscritos = JSON.parse(fs.readFileSync(filePath));
                            }

                            inscritos.push({
                                nombreInvocador,
                                userId: modalInteraction.user.displayName,
                            });

                            fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));

                            // Enviar mensaje privado de confirmación
                            const embedAprobado = new EmbedBuilder()
                                .setColor('#79E096')
                                .setDescription('<:check:1286772042657566780> ¡Has sido aceptado en el torneo! ¡Mucha suerte!');

                            await modalInteraction.user.send({
                                embeds: [embedAprobado],
                            });

                            await i.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#79E096')
                                        .setDescription('<:check:1286772042657566780> Solicitud aceptada.'),
                                ],
                                ephemeral: true,
                            });
                        } else if (i.customId === 'denegar') {
                            // Denegar la solicitud
                            await modalInteraction.user.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#F87171')
                                        .setDescription( '<:decline:1286772064765743197> No hemos podido confirmar tus datos, por favor vuelve a enviarlos. Si tienes problemas puedes contactar a Jedoth directamente.' ),
                                ],
                            });

                            await i.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#F87171')
                                        .setDescription('<:decline:1286772064765743197> La solicitud ha sido denegada.'),
                                ],
                                ephemeral: true,
                            });
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });
            });
        }
    },
};
