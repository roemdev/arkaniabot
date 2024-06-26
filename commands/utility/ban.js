const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
    const reason = interaction.options.getString('reason') || 'no especificada';

    try {
      const embed = new EmbedBuilder()
        .setColor('#79E096')
        .setTitle(' ')
        .setDescription(`**${target.tag}** ha sido baneado. **Razón:** ${reason}`);
      
      await interaction.guild.members.ban(target, { reason });
      interaction.channel.send({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error('Error al intentar banear al usuario:', error);
      await interaction.reply({ content: 'Ocurrió un error al intentar banear al usuario.', ephemeral: true });
    }
  },
};
