const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Verifica si el miembro que se unió es un bot o no
    const isBot = member.user.bot;

    // Define los roles que se asignarán
    const roleUser = member.guild.roles.cache.find(role => role.id === "1215767915329228890");
    const roleBot = member.guild.roles.cache.find(role => role.id === "1211736684190769274");

    // Crear un embed de bienvenida
    const welcomeEmbed = new EmbedBuilder()
  .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
  .setTitle("Bienvenido/a a Arkania")
  .setColor("NotQuiteBlack")
  .setDescription(`Ven a compartir con nosotros en <#1173781298721063014>\n\nRevisa <#1257757995996282880> y <#1282217741851561986>.`)
  .setThumbnail(member.user.displayAvatarURL())
  .setImage("https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=66e4e601&is=66e39481&hm=13f16536ca4603babfbfada027ed6b87302ede61a304a9893c1394b46661090e&")
  .setFooter({ text: `Ahora somos ${member.guild.memberCount} miembros. ¡Disfruta tu estancia!` });

    // Enviar el mensaje de bienvenida en el canal designado
    const welcomeChannel = member.guild.channels.cache.get("1273453941056602152");
    if (welcomeChannel) {
      welcomeChannel.send({ content: `<@${member.user.id}>`, embeds: [welcomeEmbed] });
    }

    // Asigna el rol correspondiente
    if (isBot && roleBot) {
      await member.roles.add(roleBot).catch(console.error);
    } else if (roleUser) {
      await member.roles.add(roleUser).catch(console.error);
    }
  },
};
