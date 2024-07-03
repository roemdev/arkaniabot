const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('probarembed')
        .setDescription('Probar la creación de un embed')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Esto establece el permiso necesario para usar el comando

    async execute(interaction) {
        // Verificación adicional por si acaso
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
        }

        const pruebaButton = new ButtonBuilder()
            .setCustomId('prueba')
            .setLabel('Inscribirme')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎉');

        const row = new ActionRowBuilder().addComponents(pruebaButton);

        const embed = new EmbedBuilder()
            .setColor('NotQuiteBlack')
            .setTitle('Sorteo: Un Tesla Model S')
            .setDescription(`
                Finaliza: <t:1722443400:R> (<t:1719970404:f>)
                Organizador: <@271683421065969664>
                Participantes: **24**
                Ganadores: **1**
            `)
            .setFooter({ text: '02/07/2024' });

        await interaction.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'prueba';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 0 });

        collector.on('collect', async (i) => {
            const userId = i.user.id;
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

            const embedReply = new EmbedBuilder();

            if (inscritos.includes(userId)) {
                embedReply.setColor('NotQuiteBlack').setDescription('Ya estás participando. ***Esto es una prueba***');
            } else {
                inscritos.push(userId);
                fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
                embedReply.setColor('#79E096').setDescription('¡Te has inscrito correctamente! ***Esto es una prueba***');
            }

            await i.reply({ embeds: [embedReply], ephemeral: true });
        });
    },
};
