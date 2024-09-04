const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea al usuario seleccionado")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Miembro a banear")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Razón")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No especificada";

    try {
      await interaction.guild.members.ban(target, { reason });
      const embed = new EmbedBuilder()
        .setColor("#79E096")
        .setDescription(
          `**${target.tag}** ha sido baneado. **Razón:** ${reason}`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error al intentar banear al usuario:", error);
      await interaction.reply({
        content: "Ocurrió un error al intentar banear al usuario.",
        ephemeral: true,
      });
    }
  },
};
