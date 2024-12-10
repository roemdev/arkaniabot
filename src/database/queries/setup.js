const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('./database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupdb')
        .setDescription('Configura la base de datos para guardar los datos.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        try {
            const query = `
                CREATE TABLE IF NOT EXISTS user_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(50) NOT NULL,
                    campo1 VARCHAR(255),
                    campo2 VARCHAR(255),
                    campo3 VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await db.execute(query); // Cambia "query" a "execute" con el pool

            await interaction.reply({
                content: 'La tabla `user_data` ha sido creada o ya existe en la base de datos.',
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error al crear la tabla en la base de datos:', error);
            await interaction.reply({
                content: 'Hubo un error al intentar crear la tabla en la base de datos.',
                ephemeral: true,
            });
        }
    },
};
