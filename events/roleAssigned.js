const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const booster = "1311799987474010113";
    const vip = "1311800020697354250";
    const monitoredRoles = [booster, vip];
    const notificationChannelId = "1273453941056602152";

    const addedRoleId = monitoredRoles.find(roleId => 
      !oldMember.roles.cache.has(roleId) && newMember.roles.cache.has(roleId)
    );

    if (!addedRoleId) return;

    const channel = newMember.guild.channels.cache.get(notificationChannelId);
    if (!channel || !channel.isTextBased()) return;

    const totalBoosts = newMember.guild.premiumSubscriptionCount;
    const totalVip = newMember.guild.members.cache.filter(member => 
      member.roles.cache.has(vip)
    ).size;

    const notificationEmbed = addedRoleId === booster
      ? createBoosterEmbed(newMember, totalBoosts)
      : createVipEmbed(newMember, totalVip);

    await channel.send({
      content: `<@${newMember.user.id}>`,
      embeds: [notificationEmbed],
    }).catch(console.error);
  },
};

function createBoosterEmbed(member, totalBoosts) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle(`<:boost:1313684699411124286> __${totalBoosts} ${totalBoosts === 1 || totalBoosts === 0 ? 'boost' : 'boosts'}__`)
    .setColor("#2b2d31")
    .setDescription(
      `* ¡Gracias por esa mejora épica!\n` +
      `* Haz clic [aquí](https://discord.com/channels/815280751586050098/1247632279027843152) para ver tus beneficios.`
    )
    .setThumbnail(member.user.displayAvatarURL());
}

function createVipEmbed(member, totalVip) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle(`💎 __${totalVip} VIP__`)
    .setColor("#2b2d31")
    .setDescription(
      `* ¡Un nuevo VIP se alza!\n` +
      `* Haz clic [aquí](https://discord.com/channels/815280751586050098/1247632279027843152) para ver tus beneficios.`
    )
    .setFooter({ text: "¡Disfruta de estos 30 días de beneficios!" })
    .setThumbnail(member.user.displayAvatarURL());
}
