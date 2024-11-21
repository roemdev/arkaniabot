const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const hasBoosted = !oldMember.premiumSince && newMember.premiumSince; 
    const boostChannel = newMember.guild.channels.cache.get("1173781298721063014"); // Reemplaza con el ID del canal

    try {
      if (hasBoosted && boostChannel) {
        const boostEmbed = createBoostEmbed(newMember);
        await boostChannel.send({ content: `<@${newMember.user.id}>`, embeds: [boostEmbed] });
      }
    } catch (error) {
      console.error("Ocurrió un error al enviar el mensaje de boost:", error);
    }
  },
};

// Función para crear el embed de notificación de boost
function createBoostEmbed(member) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle("¡Gracias por tu boost!")
    .setColor("NotQuiteBlack")
    .setDescription('• ¡Gracias por ese boost!\n• [Haz clic aquí para ver tus beneficios](https://discord.com/channels/815280751586050098/1128136414379397200)')
    .setThumbnail(member.user.displayAvatarURL())
}
