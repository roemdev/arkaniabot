const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ButtonBuilder, 
    ActionRowBuilder, 
    PermissionsBitField, 
    ButtonStyle, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder ,
    PermissionFlagsBits
} = require('discord.js');

const { voiceChannelsMap } = require('../../events/joinToCreate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-control')
        .setDescription('Controla los permisos de un canal de voz con botones interactivos.')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),


    async execute(interaction) {
        const voiceChannelState = {};

        // Botones de control
        const buttons = [
            new ButtonBuilder()
                .setCustomId('lock')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('hide')
                .setEmoji('👁️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('kick')
                .setEmoji('🔫')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('info')
                .setEmoji('📑')
                .setStyle(ButtonStyle.Secondary)
        ];

        const buttonRow = new ActionRowBuilder().addComponents(buttons);

        // Embed inicial
        const embed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('Interfaz del VoiceMaster')
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription('Haz clic en los botones de abajo para controlar tu canal de voz.')
            .addFields({ name: "Uso de los botones", value: "🔒 — **Bloquear** el canal de voz.\n👁️ — **Ocultar** el canal de voz.\n🔫 — **Expulsar** a alguien del canal de voz.\n📑 — **Mostrar** la información del canal de voz." });

        // Enviar el mensaje con los controles
        const message = await interaction.channel.send({ 
            embeds: [embed], 
            components: [buttonRow], 
        });

        // Crear colector de interacciones
        const filter = (i) => buttons.some(button => button.data.custom_id === i.customId);
        const collector = message.createMessageComponentCollector({ filter });

        collector.on('collect', async (i) => {
            const userId = i.user.id;
            const voiceChannel = i.member.voice.channel;

            if (!voiceChannel) {
                return replyWithEmbed(i, '#FFC868', `<:advise:1313237521634689107> No estás **conectado** a un canal de voz.`, true);
            }

            if (i.customId === 'info') {
                await handleInfoButton(i, voiceChannel);
                return;
            }

            const isOwner = voiceChannelsMap.get(voiceChannel.id) === i.user.id;;
            if (!isOwner) {
                return replyWithEmbed(i, '#F87171', '<:deny:1313237501359558809> Solo el **creador** del canal puede ejecutar esta acción.', true);
            }

            switch (i.customId) {
                case 'lock':
                    await toggleChannelLock(i, voiceChannel, voiceChannelState);
                    break;

                case 'hide':
                    await toggleChannelVisibility(i, voiceChannel, voiceChannelState);
                    break;

                case 'kick':
                    await handleMemberKick(i, voiceChannel);
                    break;

                default:
                    break;
            }
        });
    },
};

// Utility Functions
function checkIfUserOwnsChannel(channel, username) {
    return channel.name === username;
}

async function toggleChannelLock(interaction, channel, state) {
    const isLocked = channel.permissionOverwrites.cache
        .get(channel.guild.id)
        ?.deny.has(PermissionsBitField.Flags.Connect);

    await channel.permissionOverwrites.edit(channel.guild.id, {
        [PermissionsBitField.Flags.Connect]: isLocked ? null : false,
    });

    const newState = !isLocked;
    state[interaction.user.id] = { ...state[interaction.user.id], lock: newState };

    replyWithEmbed(
        interaction,
        newState ? '#FFC868' : '#79E096',
        newState ? `<:advise:1313237521634689107> Tu canal de voz fue **bloqueado**.` : `<:check:1313237490395648021> Tu canal de voz fue **desbloqueado**.`,
        true
    );
}

async function toggleChannelVisibility(interaction, channel, state) {
    const isHidden = channel.permissionOverwrites.cache
        .get(channel.guild.id)
        ?.deny.has(PermissionsBitField.Flags.ViewChannel);

    await channel.permissionOverwrites.edit(channel.guild.id, {
        [PermissionsBitField.Flags.ViewChannel]: isHidden ? null : false,
    });

    const newState = !isHidden;
    state[interaction.user.id] = { ...state[interaction.user.id], hide: newState };

    replyWithEmbed(
        interaction,
        newState ? '#FFC868' : '#79E096',
        newState ? '<:advise:1313237521634689107> Tu canal de voz se ha **ocultado**.' : '<:check:1313237490395648021> Tu canal de voz ahora es **visible**.',
        true
    );
}

async function handleMemberKick(interaction, channel) {
    const members = [...channel.members.values()].filter(member => !member.user.bot);

    if (members.length === 0) {
        return replyWithEmbed(interaction, '#F87171', '<:deny:1313237501359558809> No hay miembros para **expulsar**.', true);
    }

    const options = members.map(member => new StringSelectMenuOptionBuilder()
        .setLabel(member.user.username)
        .setValue(member.id)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('selectKick')
        .setPlaceholder('Selecciona un miembro para expulsar')
        .addOptions(options);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: 'Selecciona un miembro para expulsar:',
        components: [selectRow],
        ephemeral: true,
    });

    const filter = (i) => i.customId === 'selectKick';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (selectInteraction) => {
        const memberId = selectInteraction.values[0];
        const member = channel.members.get(memberId);

        if (!member === '271683421065969664') {
            await member.voice.disconnect();
            replyWithEmbed(
                selectInteraction,
                '#79E096',
                `<:check:1313237490395648021> <@${interaction.user.id}>: El usuario **${member.user.username}** ha sido **expulsado** de tu canal de voz.`,
                true
            );
        } else {
            replyWithEmbed(
                selectInteraction,
                '#F87171',
                `<:deny:1313237501359558809> <@${interaction.user.id}>: No puedo **expulsarte** de tu canal de voz.`,
                true
            )
        }
    });
}

async function handleInfoButton(interaction, channel) {
    if (!channel) {
        return replyWithEmbed(interaction, '#F87171', '<:deny:1313237501359558809> No estás en un **canal de voz**.', true);
    }

    const isLocked = channel.permissionOverwrites.cache
        .get(channel.guild.id)
        ?.deny.has(PermissionsBitField.Flags.Connect) || false;

    const isHidden = channel.permissionOverwrites.cache
        .get(channel.guild.id)
        ?.deny.has(PermissionsBitField.Flags.ViewChannel) || false;

        const owner = voiceChannelsMap?.get(channel.id) || 'Desconocido';
        const membersCount = channel.members.filter(member => !member.user.bot).size;
        const creationDate = `<t:${Math.floor(channel.createdAt.getTime() / 1000)}:R>`;
        
        const infoEmbed = new EmbedBuilder()
            .setColor('#FFC868')
            .setTitle(`Nombre: ${channel.name}`)
            .setAuthor({ name: 'Información del canal de voz', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`
                **Dueño:** <@${owner}>
                **Creado:** ${creationDate}
                **Bloqueado:** ${isLocked ? '<:check:1313237490395648021>' : '<:deny:1313237501359558809>'}
                **Invisible:** ${isHidden ? '<:check:1313237490395648021>' : '<:deny:1313237501359558809>'}
                **Online:** \`${membersCount}\`
            `);
        
        return interaction.reply({
            embeds: [infoEmbed],
            ephemeral: true,
        });
        
}

function replyWithEmbed(interaction, color, description, ephemeral = false) {
    return interaction.reply({
        embeds: [new EmbedBuilder().setColor(color).setDescription(description)],
        ephemeral,
    });
}