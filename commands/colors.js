const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('colors')
    .setDescription('Crea un mensaje de autoroles para elegir colores'),

  async execute(interaction) {
    const roles = [
      { label: 'Manzana', value: '1288966787160870922', emoji: '🍎' },
      { label: 'Mandarina', value: '1288966789698424832', emoji: '🍊' },
      { label: 'Banana', value: '1288966791892176907', emoji: '🍌' },
      { label: 'Arándano', value: '1288966797051166854', emoji: '🫐' },
      { label: 'Uva', value: '1288966794115289308', emoji: '🍇' },
      { label: 'Sandía', value: '1288966794605760604', emoji: '🍉' },
      { label: 'Pera', value: '1288966793305522278', emoji: '🍐' },
      { label: 'Cacahuate', value: '1288966795868373002', emoji: '🥜' },
      { label: 'Bola 8', value: '1288968686954221651', emoji: '🎱' },
      { label: 'Remover color', value: 'none', emoji: '❌' }
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-color-role')
      .setPlaceholder('Selecciona tu color')
      .addOptions(roles.map(role => ({
        label: role.label,
        value: role.value,
        emoji: role.emoji,
      })));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setColor('NotQuiteBlack')
      .setTitle('¡Dale color a tu nombre!')
      .addFields(
        { name: ' ', value: '<@&1288966787160870922> - <@&1288966766566969447>', inline: true },
        { name: ' ', value: '<@&1288966789698424832> - <@&1288966769393795114>', inline: true },
        { name: ' ', value: '<@&1288966791892176907> - <@&1288966771801591899>', inline: true },
        { name: ' ', value: '<@&1288966797051166854> - <@&1288966785319698524>', inline: true },
        { name: ' ', value: '<@&1288966794115289308> - <@&1288966776692146227>', inline: true },
        { name: ' ', value: '<@&1288966794605760604> - <@&1288966778965327893>', inline: true },
        { name: ' ', value: '<@&1288966793305522278> - <@&1288966774829744180>', inline: true },
        { name: ' ', value: '<@&1288966795868373002> - <@&1288966783167893514>', inline: true },
        { name: ' ', value: '<@&1288968686954221651> - <@&1288968694931787881>', inline: true },
      )
      .setImage('https://cdn.discordapp.com/attachments/1273453941056602152/1288964066689421354/SORTEO.png?ex=66f718d5&is=66f5c755&hm=2c0f2002e7d2b5eba60d76ad6f88d892b433698f0ced5eb93b73240be88b79a2&');

    await interaction.channel.send({ embeds: [embed], components: [row], ephemeral: false });
  },
};
