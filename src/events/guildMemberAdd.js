const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const isBot = member.user.bot;
    const userRole = member.guild.roles.cache.get("1215767915329228890");
    const botRole = member.guild.roles.cache.get("1211736684190769274");
    const welcomeChannel = member.guild.channels.cache.get("1173781298721063014");

    // Assign role based on member type
    if (isBot && botRole) {
      await member.roles.add(botRole).catch(console.error);
    } else if (userRole) {
      await member.roles.add(userRole).catch(console.error);
    }

    // Send welcome message for non-bot members
    if (!isBot && welcomeChannel) {
      const welcomeEmbed = createWelcomeEmbed(member);
      welcomeChannel.send({ content: `<@${member.user.id}>`, embeds: [welcomeEmbed] });
    }
  },
};

function createWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle("Bienvenido a Arkania")
    .setColor("#2b2d31")
    .setDescription(`Comparte con nosotros en <#1173781298721063014>.\n\nRevisa <#1257757995996282880> y <#1282215373688799284>.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setImage("https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif")
    .setFooter({ text: `Ahora somos ${member.guild.memberCount} miembros. ¡Disfruta tu estancia!` });
}
