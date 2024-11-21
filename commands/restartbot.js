const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restartbot')
    .setDescription('Reinicia el bot'),
  async execute(interaction) {
    const authorizedUserId = '271683421065969664';

    if (interaction.user.id !== authorizedUserId) {
      return interaction.reply({ content: "No tienes permisos para reiniciar el bot.", ephemeral: true });
    }

    await interaction.reply({ content: "🔄 Reiniciando el bot...", ephemeral: true });

    process.exit();
  }
};
