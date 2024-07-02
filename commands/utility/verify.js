const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Verifícate para obtener acceso al resto de los canales.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const verificarRoleId = '1257333968118747146'; // Reemplaza con el ID del rol de verificación

    const verificarButton = new ButtonBuilder()
      .setCustomId('verificar')
      .setLabel('Verificarme')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✔');

    const row = new ActionRowBuilder()
      .addComponents(verificarButton);

    const embed = new EmbedBuilder()
        .setColor('NotQuiteBlack')
        .setTitle('Sistema de verificación.')
        .setDescription('Debes verificarte para poder ver el resto de canales.');

    await interaction.channel.send({embeds: [embed], components: [row]});

    const filter = i => i.customId === 'verificar';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 0 });

    collector.on('collect', async (i) => {
        const embed = new EmbedBuilder().setTitle(' ');

        if (i.member.roles.cache.has(verificarRoleId)) {
            embed.setColor('NotQuiteBlack').setDescription('Ya te has verificado.');
        } else {
            await i.member.roles.add(verificarRoleId);
            embed.setColor('#79E096').setDescription('¡Te has verificado correctamente!');
        }

        await i.reply({ embeds: [embed], ephemeral: true });
    });
  },
};
