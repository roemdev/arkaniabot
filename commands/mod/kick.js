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
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),
    async execute(interaction) {
        const user = interaction.user; // The user executing the command
        const member = interaction.options.getMember('usuario'); // The member to be kicked
        const reason = interaction.options.getString('razón') || 'No especificada.';
        const deleteMessages = interaction.options.getBoolean('eliminar_mensajes') || false;

        const allowedRoles = {
            '991490018151514123': 1, // Max 1 expulsion per hour
            '1251292331852697623': 5 // Max 5 expulsions per hour
        };

        // Check if the user has the required role
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
        const userId = user.id;

        // Check the expulsion limit
        const now = Date.now();
        if (!expulsions.has(userId)) {
            expulsions.set(userId, { count: 0, resetTime: now + 3600000 }); // 1 hour in milliseconds
        }
        const userData = expulsions.get(userId);

        // If an hour has passed, reset the count
        if (now > userData.resetTime) {
            userData.count = 0;
            userData.resetTime = now + 3600000; // Reset the counter to the new hour
        }

        // Check if the expulsion limit has been reached
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

        // Check if the member can be kicked
        if (!member || !member.kickable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> No puedo expulsar a este usuario. Verifica que el usuario exista o que tenga un rol inferior al mío.')
                ],
                ephemeral: true
            });
        }

        try {
            // Delete messages if the option is enabled
            if (deleteMessages) {
                const channelMessages = await interaction.channel.messages.fetch({ limit: 100 });
                const userMessages = channelMessages.filter(msg => msg.author.id === member.id);
                await interaction.channel.bulkDelete(userMessages, true).catch(err => {
                    console.error('Error al eliminar mensajes:', err);
                });
            }

            // Send a private message to the member
            const embedDM = new EmbedBuilder()
                .setColor("NotQuiteBlack")
                .setDescription(`Has sido expulsado del servidor **${interaction.guild.name}**. **Razón:** ${reason}.`);
            await member.send({ embeds: [embedDM] }).catch(() => {
                console.log(`No se pudo enviar el mensaje privado a ${member.tag}.`);
            });

            // Kick the member
            await member.kick(reason);

            // Update the expulsion counter
            userData.count += 1;
            expulsions.set(userId, userData);

            const resetTimestamp = Math.floor(userData.resetTime / 1000);
            const expulsionsLeft = maxExpulsions - userData.count;

            // Confirm the expulsion to the user who executed the command
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription(`<:check:1313237490395648021> El usuario **${member.tag}** ha sido expulsado exitosamente.\nExpulsiones restantes (${expulsionsLeft}/${maxExpulsions}). Reinicio: <t:${resetTimestamp}:R>.`)
                ],
                ephemeral: true
            });

            // Send a message to a specific log channel about the expulsion
            const expulsionChannel = interaction.guild.channels.cache.get('1284140644843126794');
            if (expulsionChannel) {
                const embedChannel = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('Miembro expulsado')
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })  // Log who executed the command
                    .setDescription(`He expulsado a **${member.tag}**.\nRazón: **${reason}**.`)
                    .setTimestamp()
                    .setFooter({ text: "ArkaniaBot logs" });
                await expulsionChannel.send({ embeds: [embedChannel] });
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