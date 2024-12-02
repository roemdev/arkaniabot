const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Mapa para rastrear bans por usuario
const bans = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas banear.')
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
        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razón') || 'No especificada.';
        const eliminarMensajes = interaction.options.getBoolean('eliminar_mensajes') || false;
        const miembro = interaction.guild.members.cache.get(usuario.id);

        const rolesPermitidos = {
            '991490018151514123': 1, // Máximo 1 baneo por hora
            '1251292331852697623': 5 // Máximo 5 baneos por hora
        };

        // Verificar el rol del usuario
        const rolUsuario = interaction.member.roles.cache.find(r => Object.keys(rolesPermitidos).includes(r.id));
        if (!rolUsuario) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:deny:1313237501359558809> No tienes permiso para usar este comando.')
                ],
                ephemeral: true
            });
        }

        const maxBaneos = rolesPermitidos[rolUsuario.id];
        const userId = interaction.member.id;

        // Verificar el límite de baneos
        const ahora = Date.now();
        if (!bans.has(userId)) {
            bans.set(userId, { count: 0, resetTime: ahora + 3600000 }); // 1 hora en milisegundos
        }
        const datosUsuario = bans.get(userId);

        if (ahora > datosUsuario.resetTime) {
            datosUsuario.count = 0;
            datosUsuario.resetTime = ahora + 3600000;
        }

        if (datosUsuario.count >= maxBaneos) {
            const reinicioTimestamp = Math.floor(datosUsuario.resetTime / 1000);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription(`<:deny:1313237501359558809> Has alcanzado el límite de baneos (${maxBaneos}/${maxBaneos}). Podrás volver a banear <t:${reinicioTimestamp}:R>.`)
                ],
                ephemeral: true
            });
        }

        // Verificar si el usuario es baneable
        if (!miembro || !miembro.bannable) {
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
            // Eliminar mensajes si la opción está habilitada
            if (eliminarMensajes) {
                const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
                const mensajesUsuario = mensajes.filter(msg => msg.author.id === usuario.id);
                await interaction.channel.bulkDelete(mensajesUsuario, true);
            }

            // Enviar mensaje privado al usuario
            const embedDM = new EmbedBuilder()
                .setColor('NotQuiteBlack')
                .setDescription(`Has sido baneado del servidor **${interaction.guild.name}**. **Razón:** ${razon}.`);

            await usuario.send({ embeds: [embedDM] }).catch(() => {
                console.log(`No se pudo enviar el mensaje privado a ${usuario.tag}.`);
            });

            // Bannear al usuario
            await miembro.ban({ reason: razon });

            datosUsuario.count += 1;
            bans.set(userId, datosUsuario);

            const reinicioTimestamp = Math.floor(datosUsuario.resetTime / 1000);
            const baneosRestantes = maxBaneos - datosUsuario.count;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription(`<:check:1313237490395648021> El usuario **${usuario.tag}** ha sido baneado exitosamente.\nBaneos restantes (${baneosRestantes}/${maxBaneos}). Reinicio: <t:${reinicioTimestamp}:R>.`)
                ],
                ephemeral: true
            });

            const canalBaneos = interaction.guild.channels.cache.get('1284140644843126794');
            if (canalBaneos) {
                const embedCanal = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription(`He baneado a **${usuario.tag}** por orden de **${interaction.user.tag}**.\nRazón: ${razon}.`);
                await canalBaneos.send({ embeds: [embedCanal] });
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
