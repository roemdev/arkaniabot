const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("Comandos de moderación.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ban")
        .setDescription("Banea al usuario seleccionado.")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Miembro a banear")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("La razón del baneo.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kick")
        .setDescription("Expulsa al usuario seleccionado.")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Miembro a expulsar")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Motivo de la expulsión.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unban")
        .setDescription("Desbanea a un usuario por su ID.")
        .addStringOption((option) =>
          option
            .setName("user_id")
            .setDescription("ID del usuario a desbanear.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Razón del desbaneo.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("warn")
        .setDescription(
          "Advierte a un usuario y registra la advertencia en el canal de logs."
        )
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Miembro a advertir")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("La razón de la advertencia.")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const logChannelId = "1256736903672365169"; // Reemplaza con el ID de tu canal de logs
    const target = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") ||
      "No se ha especificado una razón.";

    if (subcommand === "ban") {
      try {
        const embed = new EmbedBuilder()
          .setColor("#79E096")
          .setTitle(" ")
          .setDescription(
            `**${target.tag}** ha sido baneado. **Razón:** ${reason}`
          );

        await interaction.guild.members.ban(target, { reason });

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        } else {
          console.error("No se encontró el canal con la ID especificada.");
        }

        await interaction.reply({
          content: "Usuario baneado :white_check_mark:",
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error al intentar banear al usuario:", error);
        await interaction.reply({
          content: "Ocurrió un error al intentar banear al usuario.",
          ephemeral: true,
        });
      }
    } else if (subcommand === "kick") {
      try {
        const embed = new EmbedBuilder()
          .setColor("#79E096")
          .setTitle(" ")
          .setDescription(
            `**${target.tag}** ha sido *expulsado*. **Razón:** ${reason}`
          );

        await interaction.guild.members.kick(target, { reason });

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        } else {
          console.error("No se encontró el canal con la ID especificada.");
        }

        await interaction.reply({
          content: "El usuario fue expulsado exitosamente.",
          ephemeral: true,
        });
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
        await interaction.guild.bans.remove(user.id, reason);

        const embed = new EmbedBuilder()
          .setColor("#79E096")
          .setTitle(" ")
          .setDescription(
            `**${user.tag}** ha sido desbaneado. **Razón:** ${reason}`
          );

        interaction.channel.send({ embeds: [embed] });
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
        return interaction.reply({
          content: "No se pudo encontrar al miembro especificado.",
          ephemeral: true,
        });
      }

      const warnEmbed = new EmbedBuilder()
        .setColor("#FFC868")
        .setTitle(" ")
        .setDescription(
          `${memberTarget} ha sido advertido. Motivo: **${reason}**`
        );

      const logEmbed = new EmbedBuilder()
        .setColor("#FFC868")
        .setTitle("Usuario Advertido")
        .addFields(
          {
            name: "Usuario",
            value: `${memberTarget.user.tag} (${memberTarget.id})`,
            inline: true,
          },
          { name: "Moderador", value: `${interaction.user.tag}`, inline: true },
          { name: "Razón", value: reason, inline: false }
        )
        .setTimestamp();

      try {
        await memberTarget.send({ embeds: [warnEmbed] });

        const logChannel = await interaction.guild.channels.fetch(logChannelId);
        await logChannel.send({ embeds: [logEmbed] });

        await interaction.reply({
          content: `**${memberTarget.user.tag}** ha sido advertido.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error al intentar advertir al usuario:", error);
        await interaction.reply({
          content: "Ocurrió un error al intentar advertir al usuario.",
          ephemeral: true,
        });
      }
    }
  },
};
