const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    // ID del rol que deseas monitorear
    const roleId = '1311791787643375636';

    // Verificar si el rol fue asignado
    const roleAdded = !oldMember.roles.cache.has(roleId) && newMember.roles.cache.has(roleId);
    if (!roleAdded) return;

    // Crear embed
    const embed = new EmbedBuilder()
      .setColor('#79E096') // Color positivo
      .setDescription(`Hola, ${newMember}!`) // Saludo al usuario
      .setTimestamp();

    // Enviar mensaje en el canal por defecto o un canal específico
    const channel = newMember.guild.systemChannel || newMember.guild.channels.cache.find(c => c.type === 0);
    if (!channel) return;

    channel.send({
      content: `${newMember}`, // Etiqueta al usuario fuera del embed
      embeds: [embed],
    });
  },
};
