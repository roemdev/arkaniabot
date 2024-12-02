const { Events, ChannelType } = require('discord.js');

// Objeto para rastrear los canales creados dinámicamente
const voiceChannelsMap = new Map();

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const guild = newState.guild;

        // ID del canal de voz "base" donde se generarán nuevos canales
        const canalBaseID = '1312872660715175956';

        // Si el usuario entra al canal base
        if (newState.channelId === canalBaseID && oldState.channelId !== canalBaseID) {
            const miembro = newState.member;

            // Crear un nuevo canal de voz con el nombre del usuario
            const nuevoCanal = await guild.channels.create({
                name: `${miembro.displayName}`, // Usamos el nombre del miembro
                type: ChannelType.GuildVoice,
                parent: newState.channel.parent,
                permissionOverwrites: [
                    {
                        id: miembro.id,
                        allow: ['Connect', 'Speak'], 
                    },
                ],
            });

            // Mover al usuario al nuevo canal
            await miembro.voice.setChannel(nuevoCanal);

            // Agregar el canal al mapa
            voiceChannelsMap.set(nuevoCanal.id, nuevoCanal);
        }

        // Si un canal creado dinámicamente queda vacío, eliminarlo inmediatamente
        if (oldState.channelId && voiceChannelsMap.has(oldState.channelId)) {
            const canal = voiceChannelsMap.get(oldState.channelId);

            if (canal.members.size === 0) {
                try {
                    await canal.delete(); // Eliminar el canal inmediatamente
                    voiceChannelsMap.delete(canal.id); // Removerlo del mapa
                } catch (error) {
                    console.error(`Error al eliminar el canal de voz: ${error.message}`);
                }
            }
        }
    },
};
