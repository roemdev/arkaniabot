const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoroles')
    .setDescription('Crea un mensaje de autoroles'),
  
  async execute(interaction) {
    // IDs de los roles
    const roles = {
      "1️⃣": "1286300137936912405",
      "2️⃣": "1286300143213215848",
      "3️⃣": "1286300145310236745",
    };

    // Embed que se enviará con las reacciones
    const embed = new EmbedBuilder()
      .setColor('NotQuiteBlack')
      .setTitle('NOTIFICACIONES')
      .setDescription(
        '`1️⃣` - <@&1286300137936912405>\n' +
        '`2️⃣` - <@&1286300143213215848>\n' +
        '`3️⃣` - <@&1286300145310236745>'
      );

    // Envía el mensaje con el embed
    const message = await interaction.channel.send({ embeds: [embed] });

    // Añade las reacciones
    await message.react('1️⃣');
    await message.react('2️⃣');
    await message.react('3️⃣');

    // Confirma que se ha enviado el mensaje
    const confirmEmbed = new EmbedBuilder()
      .setColor('#79E096')
      .setDescription('<:check:1286772042657566780> ¡Mensaje de autoroles enviado!')
    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

    // Reacción al evento
    const filter = (reaction, user) => !user.bot && roles[reaction.emoji.name];
    
    const collector = message.createReactionCollector({ filter });

    collector.on('collect', async (reaction, user) => {
      const roleId = roles[reaction.emoji.name];
      const member = await reaction.message.guild.members.fetch(user.id);
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        console.log(`Removed role ${roleId} from ${user.tag}`);
      } else {
        await member.roles.add(roleId);
        console.log(`Added role ${roleId} to ${user.tag}`);
      }
    });

    collector.on('remove', async (reaction, user) => {
      const roleId = roles[reaction.emoji.name];
      const member = await reaction.message.guild.members.fetch(user.id);
      await member.roles.remove(roleId);
      console.log(`Removed role ${roleId} from ${user.tag}`);
    });
  },
};
