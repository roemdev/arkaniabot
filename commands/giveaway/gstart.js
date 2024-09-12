const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");

// Helper function to convert duration string to milliseconds
function convertDuration(duration) {
  const unit = duration.slice(-1);
  const unitQty = parseInt(duration.slice(0, -1), 10);

  if (isNaN(unitQty)) return null;

  switch (unit) {
    case "m":
      return unitQty * 60 * 1000;
    case "h":
      return unitQty * 60 * 60 * 1000;
    case "d":
      return unitQty * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gstart")
    .setDescription("Inicia un nuevo sorteo.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duración del sorteo (Formato: 1m, 1h, 1d).")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Número de winners.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("prize del sorteo.")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role_required")
        .setDescription("Rol necesario para participar en el sorteo.")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role_multiplier")
        .setDescription("Rol que da el doble de entriesQty a los miembros que lo tienen.")
    ),

  async execute(interaction) {

    // Check users permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true,
      });
    }

    // Get command options
    const duration = interaction.options.getString("duration");
    const prize = interaction.options.getString("prize");
    const winnersQty = interaction.options.getInteger("winners");
    const roleRequired = interaction.options.getRole("role_required")?.id;
    const roleMultiplier = interaction.options.getRole("role_multiplier")?.id;

    // Clean JSON file
    const filePath = "./commands/giveaway/json/giveawayEntries.json";
    fs.writeFileSync(filePath, "[]");

    // Convert duration to ms
    const durationMs = convertDuration(duration);

    if (durationMs === null) {
      return interaction.reply({
        content: "Duración inválida. Usa formatos como `1m`, `1h`, `1d`.",
        ephemeral: true,
      });
    }

    // Calculate end time
    const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);
    const endDate = new Date(
      endTimestamp * 1000
    ).toLocaleDateString("es-ES");

    // Build buttons and embeds
    const enterBtn = new ButtonBuilder()
      .setCustomId("enter")
      .setLabel(" ")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎉");

    const termsBtn = new ButtonBuilder()
      .setCustomId("terms")
      .setLabel("Términos")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(enterBtn, termsBtn);

    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle(prize)
      .setDescription(
        `Finaliza: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${interaction.user.id}>\nEntradas: **0**\nGanadores: **${winnersQty}**`
      )
      .setFooter({ text: `${endDate}` });

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "✅ Sorteo creado.",
      ephemeral: true,
    });

    // Save giveaway info
    fs.writeFileSync("./commands/giveaway/json/giveawayInfo.json", JSON.stringify({
      messageId: message.id,
      roleRequired,
      roleMultiplier
    }, null, 2));

    // Read entries from JSON file
    let entries = [];
    if (fs.existsSync(filePath)) {
      try {
        entries = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    // Config collector to manage interections with btns
    const filter = (i) =>
      i.customId === "enter" || i.customId === "terms";
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: durationMs,
    });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const userRoles = i.member.roles.cache;
      const embedReply = new EmbedBuilder();

      if (i.customId === "terms") {
        
        // Show giveaway terms
        const termsEmbed = new EmbedBuilder()
          .setColor("NotQuiteBlack")
          .setTitle("Términos del Sorteo")
          .setDescription(
            "Para inscribirte en el sorteo necesitarás comprar una entrada.\nSi eres miembro VIP tendrás dos entriesQty en lugar de una.\nSi eres miembro Diamante tendrás 3."
          );

        await i.reply({ embeds: [termsEmbed], ephemeral: true });
        return;
      }

      if (i.customId === "enter") {

        // Check if the user has the required role
        if (roleRequired && !userRoles.has(roleRequired)) {
          embedReply
            .setColor("#F87171")
            .setDescription("Para inscribirte en el sorteo debes tener el rol necesario.");
          await i.reply({ embeds: [embedReply], ephemeral: true });
          return;
        }

        if (entries.includes(userId)) {
          embedReply
            .setColor("#79E096")
            .setDescription("¡Ya estás participando!");
        } else {
          
          // Calculate entriesQty based on roles
          let entriesQty = 1;
          if (roleMultiplier && userRoles.has(roleMultiplier)) entriesQty *= 2;

          for (let j = 0; j < entriesQty; j++) {
            entries.push(userId);
          }

          fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
          embedReply
            .setColor("#79E096")
            .setDescription("¡Te has inscrito correctamente!");

          // Update embed message
          const updatedEmbed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle(prize)
            .setDescription(
              `Finaliza: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${interaction.user.id}>\nEntradas: **${entries.length}**\nGanadores: **${winnersQty}**`
            )
            .setFooter({ text: `${endDate}` });

          await message.edit({ embeds: [updatedEmbed], components: [row] });
        }
        await i.reply({ embeds: [embedReply], ephemeral: true });
      }
    });

    collector.on("end", async () => {
      if (entries.length === 0) {
        await interaction.channel.send("No hubo participantes en el sorteo.");
        return;
      }

      // Select once time winners
      const winners = new Set();

      while (winners.size < winnersQty && entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winnerID = entries[randomIndex];
        winners.add(winnerID);
        entries.splice(randomIndex, 1);
      }

      const winnersArray = Array.from(winners);
      const winnersMention = winnersArray
        .map((id) => `<@${id}>`)
        .join(", ");

      const finalEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(prize)
        .setDescription(
          `Finalizó: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${interaction.user.id}>\nEntradas: **${
            entries.length + winnersArray.length
          }**\nGanadores: **${winnersMention}**`
        )
        .setFooter({ text: `${endDate}` });

      await message.edit({ embeds: [finalEmbed], components: [] });

      // Announce winners
      const winnerMsg =
        winnersQty === 1
          ? `¡Felicidades ${winnersMention}! Has ganado **${prize}**. 🎉`
          : `¡Felicidades ${winnersMention}! Han ganado **${prize}**. 🎉`;

      await interaction.channel.send(winnerMsg);
    });
  },
};
