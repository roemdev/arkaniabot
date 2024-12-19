const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ANNOUNCEMENT_CHANNEL_ID = '1319394383996518573';
const REQUIRED_ROLE_ID = '1319394817939083384';
const STREAM_PLATFORMS = {
    youtube: { name: 'YouTube', color: '#FF0000', icon: '❤️' },
    twitch: { name: 'Twitch', color: '#9146FF', icon: '💜' },
    kick: { name: 'Kick', color: '#52C41A', icon: '💚' },
    tiktok: { name: 'TikTok', color: '#000000', icon: '🖤' }
};

function detectPlatform(link) {
    if (link.includes('youtube.com') || link.includes('youtu.be')) return STREAM_PLATFORMS.youtube;
    if (link.includes('twitch.tv')) return STREAM_PLATFORMS.twitch;
    if (link.includes('kick.com')) return STREAM_PLATFORMS.kick;
    if (link.includes('tiktok.com')) return STREAM_PLATFORMS.tiktok;
    return null;
}

function sendError(interaction, message) {
    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FFC868')
                .setDescription(`<:advise:1313237521634689107> ${message}`)
        ],
        ephemeral: true
    });
}

function createStreamEmbed(member, platform, title, link) {
    return new EmbedBuilder()
        .setColor(platform.color)
        .setTitle(title)
        .setURL(link)
        .setAuthor({
            name: `${member.user.username} está en vivo en ${platform.icon}${platform.name}`,
            iconURL: member.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`¡Únete a <@${member.user.id}> y envía saludos de parte de **Arkania**!`)
        .setImage('https://i.imgur.com/Kx4MXKq.png')
        .setTimestamp();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stream-on')
        .setDescription('Anuncia que un miembro está en vivo.')
        .addStringOption(option =>
            option.setName('enlace')
                .setDescription('Enlace de la transmisión (YouTube, Twitch, Kick o TikTok).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('Título del stream')
                .setRequired(true)),
    async execute(interaction) {
        const link = interaction.options.getString('enlace');
        const title = interaction.options.getString('titulo');
        const member = interaction.member;

        // Verifica si el usuario tiene el rol requerido
        if (!member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return sendError(interaction, 'No puedes utilizar este comando si no tienes el rol <@&1319394817939083384>.');
        }

        const platform = detectPlatform(link);
        if (!platform) {
            return sendError(interaction, 'El enlace proporcionado no pertenece a una plataforma válida (YouTube, Twitch, Kick o TikTok).');
        }

        const channel = interaction.guild.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
        if (!channel) {
            return sendError(interaction, 'No se encontró el canal de anuncios configurado.');
        }

        const embed = createStreamEmbed(member, platform, title, link);
        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#79E096')
                        .setDescription('<:check:1313237490395648021> ¡Anuncio **enviado** exitosamente!')
                ],
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            return sendError(interaction, 'Hubo un error al intentar enviar el anuncio. Por favor, inténtalo nuevamente.');
        }
    }
};
