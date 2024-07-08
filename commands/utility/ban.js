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
      
      // Enviar el mensaje al canal específico
      const logChannel = interaction.guild.channels.cache.get('1258835275065589781');
      if (logChannel) {
        logChannel.send({ embeds: [embed] });
      } else {
        console.error('No se encontró el canal con la ID especificada.');
      }

      // Responder con un mensaje efímero
      await interaction.reply({ content: 'Usuario baneado :white_check_mark:', ephemeral: true });

    } catch (error) {
      console.error('Error al intentar banear al usuario:', error);
      await interaction.reply({ content: 'Ocurrió un error al intentar banear al usuario.', ephemeral: true });
    }
  },
};