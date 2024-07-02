const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario por su ID.')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('ID del usuario a desbanear.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Razón del desbaneo.')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'no especificada.';

    try {
      const user = await interaction.client.users.fetch(userId);
      await interaction.guild.bans.remove(user.id, reason);

      const embed = new EmbedBuilder()
        .setColor('#79E096')
        .setTitle(' ')
        .setDescription(`**${user.tag}** ha sido desbaneado. **Razón:** ${reason}`);

      interaction.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error al desbanear usuario:', error);
      await interaction.reply('Ocurrió un error al intentar desbanear al usuario.');
    }
  },
};
