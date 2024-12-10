const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('./database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listdata')
        .setDescription('Muestra los datos guardados para un usuario.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Selecciona el usuario para ver sus datos.')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');

            // Consulta los datos del usuario
            const query = `SELECT campo1, campo2, campo3, created_at FROM user_data WHERE user_id = ?`;
            const [rows] = await db.execute(query, [user.id]);

            if (rows.length === 0) {
                await interaction.reply({
                    content: `No se encontraron datos para el usuario ${user.tag}.`,
                    ephemeral: true,
                });
                return;
            }

            // Crear un embed para mostrar los datos
            const embed = new EmbedBuilder()
                .setTitle(`Datos de ${user.tag}`)
                .setColor('#2b2d31') // Color de tu preferencia
                .setTimestamp();

            rows.forEach((row, index) => {
                embed.addFields({
                    name: `Registro ${index + 1}`,
                    value: `**Campo 1:** ${row.campo1 || 'No proporcionado'}\n**Campo 2:** ${row.campo2 || 'No proporcionado'}\n**Campo 3:** ${row.campo3 || 'No proporcionado'}\n**Fecha:** ${row.created_at}`,
                });
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error al listar los datos:', error);
            await interaction.reply({
                content: 'Hubo un error al intentar listar los datos. Por favor, inténtalo de nuevo.',
                ephemeral: true,
            });
        }
    },
};
