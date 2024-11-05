const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reiniciar')
    .setDescription('Reinicia el bot (solo el usuario autorizado puede usar este comando)'),
  async execute(interaction) {
    // ID del usuario autorizado para reiniciar el bot
    const authorizedUserId = '271683421065969664';

    // Verifica si el ID del usuario coincide
    if (interaction.user.id !== authorizedUserId) {
      return interaction.reply("No tienes permisos para reiniciar el bot.");
    }

    await interaction.reply('Reiniciando el bot...');

    // Cerrar el proceso para reiniciar el bot
    process.exit();
  }
};
