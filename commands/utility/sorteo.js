const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sorteo')
        .setDescription('Crea un sorteo nuevo')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    async execute(interaction) {
        // Verificación adicional por si acaso
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
        }

        const inscribirmeButton = new ButtonBuilder()
            .setCustomId('inscribirme')
            .setLabel('Inscribirme')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎉');

        const terminosButton = new ButtonBuilder()
            .setCustomId('terminos')
            .setLabel('Términos y Condiciones')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(inscribirmeButton, terminosButton);

        const filePath = './inscritos.json';
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

        const embed = new EmbedBuilder()
            .setColor('NotQuiteBlack')
            .setTitle('Sorteo: Un Tesla Model S')
            .setDescription(`
                Finaliza: <t:1722443400:R> (<t:1719970404:f>)
                Organizador: <@271683421065969664>
                Participantes: **${inscritos.length}**
                Ganadores: **1**
            `)
            .setImage('https://cdn.discordapp.com/attachments/1252998185664647209/1257870043576799403/line-border.gif?ex=6686a304&is=66855184&hm=96e9d9048f4be4163da7458182d9653b3e92624c3a9092c72036334049fbdeef&')

        const message = await interaction.channel.send({ embeds: [embed], components: [row] });

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
                        .setDescription(`
                            Finaliza: <t:1722443400:R> (<t:1719970404:f>)
                            Organizador: <@271683421065969664>
                            Participantes: **${inscritos.length}**
                            Ganadores: **1**
                        `)
                        .setImage('https://cdn.discordapp.com/attachments/1252998185664647209/1257870043576799403/line-border.gif?ex=6686a304&is=66855184&hm=96e9d9048f4be4163da7458182d9653b3e92624c3a9092c72036334049fbdeef&')
                        .setFooter({ text: '02/07/2024' });

                    await message.edit({ embeds: [updatedEmbed], components: [row] });
                }
                await i.reply({ embeds: [embedReply], ephemeral: true });
            } else if (i.customId === 'terminos') {
                const terminosEmbed = new EmbedBuilder()
                    .setColor('NotQuiteBlack')
                    .setTitle('Términos y Condiciones')
                    .setDescription(' ')
                    .addFields(
                        { name: '***`NIVEL`***', value: 'Para ser elegido como ganador debes ser **nivel 5+**.' },
                        { name: '***`PLATAFORMAS INSEGURAS`***', value: 'Nos reservamos el derecho de rechazar una plataforma si la consideramos **NO SEGURA**.' },
                        { name: '***`TIEMPO LÍMITE`***', value: 'Dispondrás de un total de 12 horas para comunicarte con el organizador y canjear tu premio.' }
                    );

                await i.reply({ embeds: [terminosEmbed], ephemeral: true });
            }
        });
    },
};