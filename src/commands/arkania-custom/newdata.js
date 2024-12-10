const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database/queries/database'); // Importar la conexión a la base de datos

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setName('newdata')
        .setDescription('Proporciona 3 datos opcionales y guárdalos en la base de datos.')
        .addStringOption(option =>
            option
                .setName('campo1')
                .setDescription('Ingresa el valor para el Campo 1')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('campo2')
                .setDescription('Ingresa el valor para el Campo 2')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('campo3')
                .setDescription('Ingresa el valor para el Campo 3')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            // Obtener los valores de las opciones
            const userId = interaction.user.id;
            const campo1 = interaction.options.getString('campo1') || null;
            const campo2 = interaction.options.getString('campo2') || null;
            const campo3 = interaction.options.getString('campo3') || null;

            // Insertar los datos en la base de datos
            const query = `
                INSERT INTO user_data (user_id, campo1, campo2, campo3)
                VALUES (?, ?, ?, ?)
            `;
            await db.execute(query, [userId, campo1, campo2, campo3]);

            // Responder al usuario
            await interaction.reply({
                content: `Tus datos han sido guardados correctamente.\n**Campo 1**: ${campo1 || 'No proporcionado'}\n**Campo 2**: ${campo2 || 'No proporcionado'}\n**Campo 3**: ${campo3 || 'No proporcionado'}`,
                ephemeral: true,
            });

            console.log(`Datos guardados para el usuario ${userId}`);
        } catch (error) {
            console.error('Error al guardar los datos en la base de datos:', error);
            await interaction.reply({
                content: 'Hubo un error al guardar tus datos. Por favor, inténtalo de nuevo.',
                ephemeral: true,
            });
        }
    },
};
