const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const monitoredRoleId = "1241182617504579594";
    const notificationChannelId = "1173781298721063014";

    const roleAdded = !oldMember.roles.cache.has(monitoredRoleId) &&
                      newMember.roles.cache.has(monitoredRoleId);

    if (roleAdded) {
      const channel = newMember.guild.channels.cache.get(notificationChannelId);

      if (!channel) return;

      const totalBoosts = newMember.guild.premiumSubscriptionCount;
      const notificationEmbed = createNotificationEmbed(newMember, totalBoosts);
      await channel.send({
        content: `<@${newMember.user.id}>`,
        embeds: [notificationEmbed],
      }).catch(console.error);
    }
  },
};

function createNotificationEmbed(member, totalBoosts) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle(`<:boost:1313684699411124286> __${totalBoosts} ${totalBoosts === 1 || totalBoosts === 0 ? 'boost' : 'boosts'}__`)
    .setColor("#2b2d31")
    .setDescription(
      `* ¡Gracias por el boost!\n` +
      `* Haz clic [aquí](https://discord.com/channels/815280751586050098/1247632279027843152) para ver tus beneficios.`
    )
    .setThumbnail(member.user.displayAvatarURL());
}