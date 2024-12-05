const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Map to track bans by user
const bans = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un miembro del servidor.')
        .addUserOption(option =>
            option.setName('miembro')
                .setDescription('El miembro que deseas banear.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón del baneo.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('eliminar_mensajes')
                .setDescription('¿Eliminar los últimos 100 mensajes del usuario?'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),
    async execute(interaction) {
        const user = interaction.user; // The user executing the command
        const member = interaction.options.getUser('miembro'); // The member to be banned
        const reason = interaction.options.getString('razón') || 'No especificada.';
        const deleteMsgs = interaction.options.getBoolean('eliminar_mensajes') || false;
        const memberId = interaction.guild.members.cache.get(member.id);

        const allowedRoles = {
            '991490018151514123': 1,  // Max 1 ban per hour
            '1251292331852697623': 5  // Max 5 bans per hour
        };

        // Check user role
        const userRole = interaction.member.roles.cache.find(r => Object.keys(allowedRoles).includes(r.id));
        if (!userRole) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> 👤: No tienes permiso para usar este comando.')
                ],
                ephemeral: true
            });
        }

        const banLimit = allowedRoles[userRole.id];
        const userId = interaction.member.id;

        // Check user ban limit
        const now = Date.now();
        if (!bans.has(userId)) {
            bans.set(userId, { count: 0, resetTime: now + 3600000 });
        }

        const userData = bans.get(userId);

        if (now > userData.resetTime) {
            userData.count = 0;
            userData.resetTime = now + 3600000;
        }

        if (userData.count >= banLimit) {
            const timestampReset = Math.floor(userData.resetTime / 1000);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription(`<:deny:1313237501359558809> Has alcanzado el límite de baneos (${banLimit}/${banLimit}). Podrás volver a banear <t:${timestampReset}:R>.`)
                ],
                ephemeral: true
            });
        }

        // Check if member is banable
        if (!member || !member.bannable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> No puedo banear a este usuario. Verifica que el usuario exista o que tenga un rol inferior al mío.')
                ],
                ephemeral: true
            });
        }

        try {
            // Delete messages if the option is enabled
            if (deleteMsgs) {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const memberMsgs = messages.filter(msg => msg.author.id === member.id);
                await interaction.channel.bulkDelete(memberMsgs, true);
            }

            // Send a private message to the banned member
            const embedDM = new EmbedBuilder()
                .setColor('NotQuiteBlack')
                .setDescription(`Has sido baneado del servidor **${interaction.guild.name}**. **Razón:** ${reason}.`);

            await member.send({ embeds: [embedDM] }).catch(() => {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#F87171')
                            .setDescription('<:deny:1313237501359558809> No se pudo enviar el mensaje privado al miembro baneado.')
                    ],
                    ephemeral: true
                });
            });

            // Ban the member
            await memberId.ban({ reason: reason });

            userData.count += 1;
            bans.set(userId, userData);

            const timestampReset = Math.floor(userData.resetTime / 1000);
            const remainingBans = banLimit - userData.count;

            // Confirm ban to the user
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription(`<:check:1313237490395648021> El miembro **${member.tag}** ha sido baneado exitosamente.\nBaneos restantes (${remainingBans}/${banLimit}). Reinicio: <t:${timestampReset}:R>.`)
                ],
                ephemeral: true
            });

            // Send log to the ban channel
            const banChannel = interaction.guild.channels.cache.get('1284140644843126794');
            if (banChannel) {
            const channelEmbed = new EmbedBuilder()
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setTitle('Miembro baneado')
                .setColor('#2b2d31')
                .setDescription(`He baneado a **${member.tag}**.\nRazón: **${reason}**.`)
                .setTimestamp()
                .setFooter({ text: "ArkaniaBot logs" });

            await banChannel.send({ embeds: [channelEmbed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> Ocurrió un error al intentar banear al usuario.')
                ],
                ephemeral: true
            });
        }
    },
};
