const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa al usuario seleccionado.')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('Miembro a expulsar')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Motivo de la expulsión.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('target'); 
    const reason = interaction.options.getString('reason') || 'no especificada';

    try {
      const embed = new EmbedBuilder()
        .setColor('#79E096')
        .setTitle(' ')
        .setDescription(`**${target.tag}** ha sido *expulsado*. **Razón:** ${reason}`);
      
      await interaction.guild.members.kick(target, { reason });
      interaction.channel.send({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error('Error al intentar expulsar al usuario:', error);
      await interaction.reply({ content: 'Ocurrió un error al intentar expulsar al usuario.', ephemeral: true });
    }
  },
};
