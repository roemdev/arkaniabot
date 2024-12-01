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

            // Crear un nuevo canal de voz
            const nuevoCanal = await guild.channels.create({
                name: `🔊╏voz-${voiceChannelsMap.size + 1}`,
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

        // Si un canal creado dinámicamente queda vacío, eliminarlo después de 5 segundos
        if (oldState.channelId && voiceChannelsMap.has(oldState.channelId)) {
            const canal = voiceChannelsMap.get(oldState.channelId);

            if (canal.members.size === 0) {
                // Esperar 5 segundos antes de eliminar
                setTimeout(async () => {
                    if (canal.members.size === 0) {
                        await canal.delete().catch(console.error);
                        voiceChannelsMap.delete(canal.id);
                    }
                }, 5000);
            }
        }
    },
};
