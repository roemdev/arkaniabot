const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbanea a un usuario por su ID")
    .addStringOption((option) =>
      option
        .setName("user_id")
        .setDescription("ID del usuario")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Razón")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const userId = interaction.options.getString("user_id");
    const reason = interaction.options.getString("reason") || "No especificada";

    try {
      const user = await interaction.client.users.fetch(userId);
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.get(user.id);

      if (!bannedUser) {
        const embed = new EmbedBuilder()
          .setColor("#F87171")
          .setDescription(`**${user.tag}** no está baneado.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await interaction.guild.bans.remove(user.id, reason);
      const embed = new EmbedBuilder()
        .setColor("#79E096")
        .setDescription(
          `**${user.tag}** ha sido desbaneado. **Razón:** ${reason}`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error al desbanear usuario:", error);
      await interaction.reply({
        content: "Ocurrió un error al intentar desbanear al usuario.",
        ephemeral: true,
      });
    }
  },
};
