const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa al usuario seleccionado")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Miembro a expulsar")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Razón")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No especificada";
    const memberTarget = interaction.options.getMember("target");

    if (!memberTarget) {
      const embed = new EmbedBuilder()
        .setColor("#F87171")
        .setDescription("El usuario no se encuentra en el servidor.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await memberTarget.kick(reason);
      const embed = new EmbedBuilder()
        .setColor("#79E096")
        .setDescription(
          `**${target.tag}** ha sido expulsado. **Razón:** ${reason}`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error al intentar expulsar al usuario:", error);
      await interaction.reply({
        content: "Ocurrió un error al intentar expulsar al usuario.",
        ephemeral: true,
      });
    }
  },
};
