const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    // Verificar si el miembro empezó a boostear
    const hadBoost = oldMember.premiumSinceTimestamp;
    const hasBoosted = !hadBoost && newMember.premiumSinceTimestamp; 

    // Obtener el canal de boost
    const boostChannel = newMember.guild.channels.cache.get("1173781298721063014"); // Reemplaza con el ID del canal

    if (!boostChannel) {
      console.error("El canal de boost no se encontró o no es accesible.");
      return;
    }

    try {
      if (hasBoosted) {
        const boostEmbed = createBoostEmbed(newMember);
        await boostChannel.send({ 
          content: `<@${newMember.user.id}>`, 
          embeds: [boostEmbed] 
        });
      }
    } catch (error) {
      console.error("Ocurrió un error al enviar el mensaje de boost:", error);
    }
  },
};

// Función para crear el embed de notificación de boost
function createBoostEmbed(member) {
  return new EmbedBuilder()
    .setAuthor({ 
      name: member.user.tag, 
      iconURL: member.user.displayAvatarURL() 
    })
    .setTitle("¡Gracias por tu boost! 🥳")
    .setColor("NotQuiteBlack")
    .setDescription(
      '• ¡Gracias por mejorar el servidor!\n• [Descubre tus beneficios aquí](https://discord.com/channels/815280751586050098/1128136414379397200)'
    )
    .setThumbnail(member.user.displayAvatarURL());
}
