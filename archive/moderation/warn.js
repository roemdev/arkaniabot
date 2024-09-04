const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un usuario")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Miembro a advertir")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Razón")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
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
      const embed = new EmbedBuilder()
        .setColor("#FFC868")
        .setDescription(
          `**${memberTarget.user.username}** ha sido advertido. Motivo: **${reason}**`
        );
      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
      console.error("Error al intentar advertir al usuario: ", error);
      await interaction.reply({
        content: "Ocurrió un error al intentar advertir al usuario.",
        ephemeral: true,
      });
    }
  },
};
