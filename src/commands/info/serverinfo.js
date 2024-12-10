const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información sobre el servidor.'),
    async execute(interaction) {
        const guild = interaction.guild;

        // Obtener la información del servidor
        const owner = await guild.fetchOwner();
        const region = guild.preferredLocale;  // Región preferida del servidor (ya no 'guild.region')
        const totalMembers = guild.memberCount;
        const totalRoles = guild.roles.cache.size - 1; // Excluye el rol @everyone
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`; // Formato de fecha de creación del servidor

        // Obtener el icono del servidor
        const iconURL = guild.iconURL({ dynamic: true, size: 1024 });

        // Crear el embed
        const embed = new EmbedBuilder()
            .setColor("#2b2d31") // Color casual
            .setTitle(`Información del Servidor`)
            .addFields(
                { name: guild.name, value: `>>> ${guild.description || 'Sin descripción'}\n**ID:** \`${guild.id}\`\n**Creado:** ${createdAt}\n**Propietario:** ${owner}` },
                { name: 'General', value: `>>> **Miembros:** \`${totalMembers}\` | **Roles:** \`${totalRoles}\` | **Voice Region:** \`${region}\`` }
            )
            //.setDescription(`**ID del Servidor:** \`${guild.id}\`\n**Descripción:** ${guild.description || 'No posee'}\n**Propietario:** ${owner.user.tag}\n**Miembros:** ${totalMembers}\n**Región:** ${region}\n**Roles:** ${totalRoles}\n**Creado en:** ${createdAt}`)
            .setThumbnail(iconURL); // Añadir el icono del servidor

        // Enviar la invitación y luego el embed
        await interaction.reply({
            content: "https://discord.gg/jA8tx5Vwe5",
            embeds: [embed],
        });
    },
};
