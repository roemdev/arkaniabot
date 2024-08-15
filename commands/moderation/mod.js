const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("Comandos de moderación")
    .addSubcommand((subcommand) =>
      subcommand
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
    )
    .addSubcommand((subcommand) =>
      subcommand
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
    )
    .addSubcommand((subcommand) =>
      subcommand
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
    )
    .addSubcommand((subcommand) =>
      subcommand
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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No especificada";

    if (subcommand === "ban") {
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
    } else if (subcommand === "kick") {
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
    } else if (subcommand === "unban") {
      const userId = interaction.options.getString("user_id");
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
    } else if (subcommand === "warn") {
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
    }
  },
};
