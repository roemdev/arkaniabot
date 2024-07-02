const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario y registra la advertencia en el canal de logs.')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('Miembro a advertir')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('La razón de la advertencia.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No se ha dado la razón de la advertencia.';
    const logChannelId = '1256736903672365169'; // Reemplaza con el ID de tu canal de logs

    if (!target) {
      return interaction.reply({ content: 'No se pudo encontrar al miembro especificado.', ephemeral: true });
    }

    const warnEmbed = new EmbedBuilder()
      .setColor('#FFC868')
      .setTitle(' ')
      .setDescription(`${target} ha sido advertido. Motivo: **${reason}**`)

    const logEmbed = new EmbedBuilder()
      .setColor('#FFC868')
      .setTitle('Usuario Advertido')
      .addFields(
        { name: 'Usuario', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
        { name: 'Razón', value: reason, inline: false },
      )
      .setTimestamp();

    try {
      // Enviar la advertencia al usuario
      await target.send({ embeds: [warnEmbed] });

      // Registrar la advertencia en el canal de logs
      const logChannel = await interaction.guild.channels.fetch(logChannelId);
      await logChannel.send({ embeds: [logEmbed] });

      // Responder en el canal de comandos
      await interaction.reply({ content: `**${target.user.tag}** ha sido advertido.`, ephemeral: true });
    } catch (error) {
      console.error('Error al intentar advertir al usuario:', error);
      await interaction.reply({ content: 'Ocurrió un error al intentar advertir al usuario.', ephemeral: true });
    }
  },
};
