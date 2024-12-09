const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const boosterRoleId = "1241182617504579594";
    const vipRoleId = "1303816942326648884";
    const monitoredRoles = [boosterRoleId, vipRoleId];
    const notificationChannelId = "1173781298721063014";

    const addedRoleId = monitoredRoles.find(roleId =>
      !oldMember.roles.cache.has(roleId) && newMember.roles.cache.has(roleId)
    );
    if (!addedRoleId) return;

    const notificationChannel = newMember.guild.channels.cache.get(notificationChannelId);
    if (!notificationChannel || !notificationChannel.isTextBased()) return;

    const totalBoosts = newMember.guild.premiumSubscriptionCount;
    const totalVipMembers = newMember.guild.members.cache.filter(member =>
      member.roles.cache.has(vipRoleId)
    ).size;

    const notificationEmbed = addedRoleId === boosterRoleId
      ? createBoosterEmbed(newMember, totalBoosts)
      : createVipEmbed(newMember, totalVipMembers);

    try {
      await notificationChannel.send({
        content: `<@${newMember.user.id}>`,
        embeds: [notificationEmbed],
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  },
};

function createBoosterEmbed(member, totalBoosts) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle(`<:boost:1313684699411124286> __${totalBoosts} ${totalBoosts === 1 ? 'boost' : 'boosts'}__`)
    .setColor("#2b2d31")
    .setDescription(
      `* ¡Gracias por esa mejora épica!\n` +
      `* Haz clic [aquí](https://discord.com/channels/815280751586050098/1247632279027843152) para ver tus beneficios.`
    )
    .setThumbnail(member.user.displayAvatarURL());
}

function createVipEmbed(member, totalVipMembers) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle(`⭐ __${totalVipMembers} VIP__`)
    .setColor("#2b2d31")
    .setDescription(
      `* ¡Un nuevo VIP se alza!\n` +
      `* Haz clic [aquí](https://discord.com/channels/815280751586050098/1247632279027843152) para ver tus beneficios.`
    )
    .setFooter({ text: "¡Disfruta de estos 30 días de beneficios!" })
    .setThumbnail(member.user.displayAvatarURL());
}
