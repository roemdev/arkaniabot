const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Selecciona el usuario del cual deseas obtener información.')
                .setRequired(false)),
    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario') || interaction.user; // Usuario seleccionado o quien ejecuta el comando
        const miembro = interaction.guild.members.cache.get(usuario.id);

        // Fechas formateadas
        const userSince = `<t:${Math.floor(usuario.createdTimestamp / 1000)}:R>`;
        const memberSince = miembro ? `<t:${Math.floor(miembro.joinedTimestamp / 1000)}:R>` : 'No es miembro';

        // Filtrar y ordenar roles si es miembro
        const roles = miembro
            ? miembro.roles.cache
                  .filter(role => role.name !== '@everyone') // Ignorar el rol everyone
                  .sort((a, b) => b.position - a.position) // Ordenar de mayor a menor
                  .map(role => role.toString()) // Convertir roles a formato legible
            : [];
        const userRoles = roles.length > 0 ? roles.join(', ') : 'Ninguno';

        // Crear el embed
        const embed = new EmbedBuilder()
            .setColor("#2b2d31") // Color casual
            .setTitle(`Información de Usuario`)
            .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
            .setDescription(`>>> **Usuario:** <@${usuario.id}>\n**ID:** \`${usuario.id}\`\n**En Discord:** ${userSince}\n**En el servidor:** ${memberSince}\n**Roles:** ${userRoles}`);

        // Responder con el embed
        await interaction.reply({ embeds: [embed] });
    },
};
