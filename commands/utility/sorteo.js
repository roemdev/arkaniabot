const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sorteo')
        .setDescription('Gestiona sorteos')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addSubcommand(subcommand =>
            subcommand
                .setName('iniciar')
                .setDescription('Inicia un nuevo sorteo'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('terminar')
                .setDescription('Termina el sorteo actual y elige un ganador')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const filePath = './json/inscritos.json';
        let inscritos = [];

        // Manejo del archivo inscritos.json
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            try {
                inscritos = JSON.parse(data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }

        // Inicializar el archivo si está vacío o no existe
        if (!Array.isArray(inscritos)) {
            inscritos = [];
        }

        if (subcommand === 'iniciar') {
            const inscribirmeButton = new ButtonBuilder()
                .setCustomId('inscribirme')
                .setLabel('Inscribirme')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎉');

            const terminosButton = new ButtonBuilder()
                .setCustomId('terminos')
                .setLabel('Términos y Condiciones')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📝');

            const row = new ActionRowBuilder().addComponents(inscribirmeButton, terminosButton);

            const embed = new EmbedBuilder()
                .setColor('NotQuiteBlack')
                .setTitle('Sorteo: Un Tesla Model S')
                .setDescription(' ')
                .addFields(
                    { name: 'Organizador', value: '<@271683421065969664>', inline: true },
                    { name: 'Finaliza', value: '<t:1722443400:R>', inline: true },
                    { name: 'Participantes', value: `**${inscritos.length}**`, inline: true },
                )
                .setImage('https://media.discordapp.net/attachments/1240392315307032597/1259135702935928862/SORTEO_1.png?ex=668a9501&is=66894381&hm=3fe8021862278f1d3270fa0a7dacee6f0661ab4dd8d28d8f5307fe014a7937d2&=&format=webp&quality=lossless');

            const message = await interaction.channel.send({ embeds: [embed], components: [row] });

            // Responder con un mensaje efímero
            await interaction.reply({ content: 'Sorteo creado :white_check_mark:', ephemeral: true });

            const filter = i => i.customId === 'inscribirme' || i.customId === 'terminos';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 0 });

            collector.on('collect', async (i) => {
                const userId = i.user.id;
                const embedReply = new EmbedBuilder();

                if (i.customId === 'inscribirme') {
                    if (inscritos.includes(userId)) {
                        embedReply.setColor('NotQuiteBlack').setDescription('Ya estás participando. ***Esto es una prueba***');
                    } else {
                        inscritos.push(userId);
                        fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
                        embedReply.setColor('#79E096').setDescription('¡Te has inscrito correctamente! ***Esto es una prueba***');

                        // Actualizar el embed original con el nuevo número de participantes
                        const updatedEmbed = new EmbedBuilder()
                            .setColor('NotQuiteBlack')
                            .setTitle('Sorteo: Un Tesla Model S')
                            .setDescription(' ')
                            .addFields(
                                { name: 'Organizador', value: '<@271683421065969664>', inline: true },
                                { name: 'Finaliza', value: '<t:1722443400:R>', inline: true },
                                { name: 'Participantes', value: `**${inscritos.length}**`, inline: true },
                            )
                            .setImage('https://media.discordapp.net/attachments/1240392315307032597/1259135702935928862/SORTEO_1.png?ex=668a9501&is=66894381&hm=3fe8021862278f1d3270fa0a7dacee6f0661ab4dd8d28d8f5307fe014a7937d2&=&format=webp&quality=lossless');

                        await message.edit({ embeds: [updatedEmbed], components: [row] });
                    }
                    await i.reply({ embeds: [embedReply], ephemeral: true });
                } else if (i.customId === 'terminos') {
                    const terminosEmbed = new EmbedBuilder()
                        .setColor('NotQuiteBlack')
                        .setTitle('Términos y Condiciones')
                        .setDescription(' ')
                        .addFields(
                            { name: '***`PARTICIPACIÓN`***', value: 'La participación en el sorteo es gratuita y está abierta a todos los miembros del gremio Arkania.', inline: true },
                            { name: '***`NIVEL`***', value: 'Para ser elegido como ganador debes ser **nivel 5+**.', inline: true },
                            { name: '***`PLATAFORMAS INSEGURAS`***', value: 'Nos reservamos el derecho de rechazar una plataforma si la consideramos **NO SEGURA**.', inline: true },
                            { name: '***`TIEMPO LÍMITE`***', value: 'Dispondrás de un total de **12 horas** para comunicarte con el organizador y canjear tu premio.', inline: true },
                            { name: '***`SELECCIÓN DEL GANADOR`***', value: 'El ganador será seleccionado aleatoriamente y anunciado en el canal de anuncios.', inline: true },
                            { name: '***`ENTREGA DEL PREMIO`***', value: 'El premio será entregado al ganador a través de paypal u otro medio disponible.', inline: true }
                        );

                    await i.reply({ embeds: [terminosEmbed], ephemeral: true });
                }
            });
        } else if (subcommand === 'terminar') {
            const inscritosButton = new ButtonBuilder()
                .setCustomId('inscritos')
                .setLabel('Inscritos')
                .setStyle(ButtonStyle.Secondary);

            const elegirGanadorButton = new ButtonBuilder()
                .setCustomId('elegirGanador')
                .setLabel('Elegir ganador')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(inscritosButton, elegirGanadorButton);

            const messages = await interaction.channel.messages.fetch({ limit: 10 });
            const lastMessage = messages.find(msg => msg.author.id === interaction.client.user.id);

            const updatedEmbed = new EmbedBuilder(lastMessage.embeds[0])
                .setDescription('El sorteo ha terminado.');

            await lastMessage.edit({ embeds: [updatedEmbed], components: [row] });

            await interaction.reply({ content: 'Sorteo terminado :white_check_mark:', ephemeral: true });

            const filter = i => i.customId === 'inscritos' || i.customId === 'elegirGanador';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 0 });

            collector.on('collect', async (i) => {
                if (i.customId === 'inscritos') {
                    const inscritosList = inscritos.map(id => `<@${id}>`).join('\n');
                    const inscritosEmbed = new EmbedBuilder()
                        .setColor('NotQuiteBlack')
                        .setTitle('Lista de inscritos')
                        .setDescription(inscritosList || 'No hay inscritos en el sorteo.');

                    await interaction.channel.send({ embeds: [inscritosEmbed] });
                } else if (i.customId === 'elegirGanador') {
                    if (inscritos.length === 0) {
                        await i.reply({ content: 'No hay participantes en el sorteo.', ephemeral: true });
                    } else {
                        const ganadorId = inscritos[Math.floor(Math.random() * inscritos.length)];
                        const ganadorEmbed = new EmbedBuilder()
                            .setColor('#FFD700')
                            .setTitle('🎉 ¡Ganador del Sorteo! 🎉')
                            .setDescription(`¡El ganador del sorteo es <@${ganadorId}>! Felicidades! 🎉`)
                            .addFields({ name: 'Premio', value: 'Un Tesla Model S' })
                            .setTimestamp();

                        await interaction.channel.send({ embeds: [ganadorEmbed] });
                        await i.reply({ content: 'Ganador elegido y anunciado.', ephemeral: true });
                    }
                }
            });
        }
    },
};
