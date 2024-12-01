const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Mapa para rastrear expulsiones por usuario
const expulsiones = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
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
        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razón') || 'No especificada.';
        const eliminarMensajes = interaction.options.getBoolean('eliminar_mensajes') || false;
        const miembro = interaction.guild.members.cache.get(usuario.id);

        const rolesPermitidos = {
            '991490018151514123': 1, // Máximo 1 expulsión por hora
            '1251292331852697623': 5 // Máximo 5 expulsiones por hora
        };

        // Verificar el rol del usuario
        const rolUsuario = interaction.member.roles.cache.find(r => Object.keys(rolesPermitidos).includes(r.id));
        if (!rolUsuario) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:decline:1286772064765743197> No tienes permiso para usar este comando.')
                ],
                ephemeral: true
            });
        }

        const maxExpulsiones = rolesPermitidos[rolUsuario.id];
        const userId = interaction.member.id;

        // Verificar el límite de expulsiones
        const ahora = Date.now();
        if (!expulsiones.has(userId)) {
            expulsiones.set(userId, { count: 0, resetTime: ahora + 3600000 }); // 1 hora en milisegundos
        }
        const datosUsuario = expulsiones.get(userId);

        // Si ha pasado una hora, resetear el contador
        if (ahora > datosUsuario.resetTime) {
            datosUsuario.count = 0;
            datosUsuario.resetTime = ahora + 3600000; // Reiniciar el contador a la nueva hora
        }

        // Comprobar si el límite de expulsiones se ha alcanzado
        if (datosUsuario.count >= maxExpulsiones) {
            const reinicioTimestamp = Math.floor(datosUsuario.resetTime / 1000);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription(`<:decline:1286772064765743197> Has alcanzado el límite de expulsiones (${maxExpulsiones}/${maxExpulsiones}). Podrás volver a expulsar <t:${reinicioTimestamp}:R>.`)
                ],
                ephemeral: true
            });
        }

        // Verificar si el usuario es expulsable
        if (!miembro || !miembro.kickable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:decline:1286772064765743197> No puedo expulsar a este usuario. Verifica que el usuario exista o que tenga un rol inferior al mío.')
                ],
                ephemeral: true
            });
        }

        try {
            // Eliminar mensajes si la opción está habilitada
            if (eliminarMensajes) {
                const channelMessages = await interaction.channel.messages.fetch({ limit: 100 });
                const userMessages = channelMessages.filter(msg => msg.author.id === usuario.id);
                await interaction.channel.bulkDelete(userMessages, true).catch(err => {
                    console.error('Error al eliminar mensajes:', err);
                });
            }

            // Enviar mensaje privado al usuario
            const embedDM = new EmbedBuilder()
                .setColor("NotQuiteBlack")
                .setDescription(`Has sido expulsado del servidor **${interaction.guild.name}**. **Razón:** ${razon}.`);
            await usuario.send({ embeds: [embedDM] }).catch(() => {
                console.log(`No se pudo enviar el mensaje privado a ${usuario.tag}.`);
            });

            // Expulsar al usuario
            await miembro.kick(razon);

            // Actualizar el contador de expulsiones
            datosUsuario.count += 1;
            expulsiones.set(userId, datosUsuario);

            const reinicioTimestamp = Math.floor(datosUsuario.resetTime / 1000);
            const expulsionesRestantes = maxExpulsiones - datosUsuario.count;

            // Confirmar la expulsión al moderador
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription(`<:check:1286772042657566780> El usuario **${usuario.tag}** ha sido expulsado exitosamente.\nExpulsiones restantes (${expulsionesRestantes}/${maxExpulsiones}). Reinicio: <t:${reinicioTimestamp}:R>.`)
                ],
                ephemeral: true
            });

            // Enviar mensaje a un canal específico sobre la expulsión
            const canalExpulsiones = interaction.guild.channels.cache.get('1284140644843126794');
            if (canalExpulsiones) {
                const embedCanal = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription(`He expulsado a **${usuario.tag}** por orden de **${interaction.user.tag}**.\nRazón: ${razon}.`);
                await canalExpulsiones.send({ embeds: [embedCanal] });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#F87171')
                        .setDescription('<:decline:1286772064765743197> Ocurrió un error al intentar expulsar al usuario.')
                ],
                ephemeral: true
            });
        }
    },
};
