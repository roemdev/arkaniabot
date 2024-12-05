const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {

    // Definición de roles y canales
    const isBot = member.user.bot;
    const roleUser = member.guild.roles.cache.find(role => role.id === "1215767915329228890");
    const roleBot = member.guild.roles.cache.find(role => role.id === "1211736684190769274");
    const welcomeChannel = member.guild.channels.cache.get("1173781298721063014");

    // Asignar roles según si es bot o usuario
    if (isBot && roleBot) {
      await member.roles.add(roleBot).catch(console.error);
    } else if (roleUser) {
      await member.roles.add(roleUser).catch(console.error);
    }

    // Enviar mensaje de bienvenida solo si es un usuario
    if (!isBot && welcomeChannel) {
      const welcomeEmbed = createWelcomeEmbed(member);
      welcomeChannel.send({ content: `<@${member.user.id}>`, embeds: [welcomeEmbed] });
    }
  },
};

// Función para crear el embed de bienvenida
function createWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle("Bienvenido a Arkania")
    .setColor("#2b2d31")
    .setDescription(`Comparte con nosotros en <#1173781298721063014>.\n\nRevisa <#1257757995996282880> y <#1282215373688799284>.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setImage("https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=66e4e601&is=66e39481&hm=13f16536ca4603babfbfada027ed6b87302ede61a304a9893c1394b46661090e&")
    .setFooter({ text: `Ahora somos ${member.guild.memberCount} miembros. ¡Disfruta tu estancia!` });
}