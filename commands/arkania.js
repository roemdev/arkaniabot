const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("arkania")
    .setDescription("Envía el enlace de invitación del servidor."),

  async execute(interaction) {
    const link = "https://discord.gg/jA8tx5Vwe5";
    interaction.reply(`🔗 ${link}`);
  },
};
