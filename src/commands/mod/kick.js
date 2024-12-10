const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Map to track expulsions by user
const expulsions = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsar a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas expulsar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón de la expulsión.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('eliminar_mensajes')
                .setDescription('Elimina los últimos 100 mensajes del usuario.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Cambiado a KickMembers
    async execute(interaction) {
        const user = interaction.user; // Usuario ejecutando el comando
        const member = interaction.options.getMember('usuario'); // Miembro a expulsar
        const reason = interaction.options.getString('razón') || 'No especificada.';
        const deleteMessages = interaction.options.getBoolean('eliminar_mensajes') || false;

        // Configuración de roles y límites
        const allowedRoles = {
            '991490018151514123': 1, // Máximo 1 expulsión por hora
            '1251292331852697623': 5 // Máximo 5 expulsiones por hora
        };

        // Validar roles del usuario
        const userRole = interaction.member.roles.cache.find(r => Object.keys(allowedRoles).includes(r.id));
        if (!userRole) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> No tienes permiso para usar este comando.')
                ],
                ephemeral: true
            });
        }

        const maxExpulsions = allowedRoles[userRole.id];
        const now = Date.now();

        // Manejo del límite de expulsiones
        const userData = expulsions.get(user.id) || { count: 0, resetTime: now + 3600000 };
        if (now > userData.resetTime) {
            userData.count = 0; // Reinicia las expulsiones
            userData.resetTime = now + 3600000;
        }

        if (userData.count >= maxExpulsions) {
            const resetTimestamp = Math.floor(userData.resetTime / 1000);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription(`<:deny:1313237501359558809> Has alcanzado el límite de expulsiones (${maxExpulsions}/${maxExpulsions}). Podrás volver a expulsar <t:${resetTimestamp}:R>.`)
                ],
                ephemeral: true
            });
        }

        // Validar si se puede expulsar al miembro
        if (!member || !member.kickable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> No puedo expulsar a este usuario. Verifica que tenga un rol inferior al mío.')
                ],
                ephemeral: true
            });
        }

        try {
            // Eliminar mensajes si está habilitado
            if (deleteMessages) {
                const channelMessages = await interaction.channel.messages.fetch({ limit: 100 });
                const userMessages = channelMessages.filter(msg => msg.author.id === member.id);
                await interaction.channel.bulkDelete(userMessages, true);
            }

            // Notificar al miembro sobre la expulsión
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFC868')
                        .setDescription(`Has sido expulsado del servidor **${interaction.guild.name}**.\n**Razón:** ${reason}`)
                ]
            }).catch(() => console.log(`No se pudo enviar DM a ${member.tag}.`));

            // Expulsar al miembro
            await member.kick(reason);

            // Actualizar el contador de expulsiones
            userData.count += 1;
            expulsions.set(user.id, userData);

            // Confirmar la expulsión al ejecutor
            const resetTimestamp = Math.floor(userData.resetTime / 1000);
            const expulsionsLeft = maxExpulsions - userData.count;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription(`<:check:1313237490395648021> El usuario **${member.user.tag}** ha sido expulsado.\nExpulsiones restantes: **${expulsionsLeft}/${maxExpulsions}**.\nReinicio: <t:${resetTimestamp}:R>.`)
                ],
                ephemeral: true
            });

            // Registrar en el canal de logs
            const logChannel = interaction.guild.channels.cache.get('1284140644843126794');
            if (logChannel) {
                await logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setTitle('Miembro Expulsado')
                            .setDescription(`**Usuario Expulsado:** ${member.user.tag}\n**Razón:** ${reason}\n**Ejecutado por:** ${user.tag}`)
                            .setTimestamp()
                    ]
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> Ocurrió un error al intentar expulsar al usuario.')
                ],
                ephemeral: true
            });
        }
    },
};
