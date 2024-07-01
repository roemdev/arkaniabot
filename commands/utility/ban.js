const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed, messageLink } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea al usuario seleccionado.')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('Miembro a banear')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('La razón del baneo.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') ?? 'No se ha dado la razón del baneo.';

    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirmar')
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancelar')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(cancel, confirm);

    const embed = new EmbedBuilder()
        .setColor('DarkButNotBlack')
        .setTitle(' ')
        .setDescription(`Estás seguro de banear a ${target} por: **${reason}**?`)

    await interaction.reply({embeds: [embed], components: [row], ephemeral: true});

    const filter = i => i.user.id === interaction.user.id && ['confirm', 'cancel'].includes(i.customId);
    const collector = await interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (i) => {
        const embed = new EmbedBuilder();
        embed.setColor('DarkButNotBlack').setTitle(' ');

      if (i.customId === 'confirm') {
        await interaction.guild.members.ban(target, { reason });
        embed.setDescription(`**${target.tag}** ha sido baneado. **Razón:** ${reason}`)
        i.update({ embeds: [embed], components: [] });

        await i.channel.send({ embeds: [embed], components: []});
        
      } else if (i.customId === 'cancel') {
          embed.setDescription('El baneo ha sido cancelado.')
          await i.update({ embeds: [embed], components: [] });
      }
    });
  },
};