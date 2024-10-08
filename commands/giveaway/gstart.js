const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, Embed } = require("discord.js");
const fs = require("fs");
const path = "./commands/giveaway/json/giveawayInfo.json"; // Ruta del JSON

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

// Function to load giveaway info from JSON
function loadGiveawayInfo() {
  if (fs.existsSync(path)) {
    try {
      return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (error) {
      console.error("Error al cargar el archivo JSON:", error);
      return null;
    }
  }
  return null;
}

// Function to save giveaway info to JSON
function saveGiveawayInfo(giveawayData) {
  fs.writeFileSync(path, JSON.stringify(giveawayData, null, 2));
}

// Function to clear entries JSON
function clearEntries() {
  const entriesFilePath = "./commands/giveaway/json/giveawayEntries.json";
  fs.writeFileSync(entriesFilePath, JSON.stringify([], null, 2)); // Reiniciar a un arreglo vacío
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gstart")
    .setDescription("Inicia un nuevo sorteo.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(option =>
      option
        .setName("duration")
        .setDescription("Duración del sorteo (Formato: 1m, 1h, 1d).")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("winners")
        .setDescription("Número de ganadores.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("prize")
        .setDescription("Premio del sorteo.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("winning_roles")
        .setDescription("IDs de los roles que permiten ganar, separados por comas.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role_multiplier")
        .setDescription("Rol que da el doble de entradas a los miembros que lo tienen.")
    ),

  async execute(interaction) {
    const { user, member, channel, options } = interaction;

    // Check user permissions
    if (!member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true,
      });
    }

    // Get command options
    const duration = options.getString("duration");
    const prize = options.getString("prize");
    const winnersQty = options.getInteger("winners");
    const roleMultiplier = options.getRole("role_multiplier")?.id;
    const winningRoles = options.getString("winning_roles").split(",").map(role => role.trim());

    // Convert duration to milliseconds
    const durationMs = convertDuration(duration);
    if (!durationMs) {
      return interaction.reply({
        content: "Duración inválida. Usa formatos como `1m`, `1h`, `1d`.",
        ephemeral: true,
      });
    }

    // Calculate end time
    const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);
    const endDate = new Date(endTimestamp * 1000).toLocaleDateString("es-ES");

    // Build enter button
    const enterBtn = new ButtonBuilder()
      .setCustomId("enter")
      .setLabel("Inscribirme")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🎉");

    const row = new ActionRowBuilder().addComponents(enterBtn);

    // Create and send the embed
    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle(prize)
      .setDescription(
        `Finaliza: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${user.id}>\nEntradas: **0**\nGanadores: **${winnersQty}**`
      )
      .setFooter({ text: `${endDate}` });

    const message = await channel.send({
      embeds: [embed],
      components: [row],
    });

    const replyEmbed = new EmbedBuilder()
      .setColor("#79E096")
      .setDescription("<:check:1286772042657566780> Sorteo creado exitosamente.")

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true, });

    // Clear previous entries
    clearEntries(); // Limpiar las participaciones

    // Save giveaway info in JSON
    const giveawayData = {
      messageId: message.id,
      channelId: channel.id,
      roleMultiplier,
      winningRoles,
      prize,
      winnersQty,
      endTimestamp,
    };

    saveGiveawayInfo(giveawayData);  // Guardar la información del sorteo en el JSON

    // Read entries from JSON file
    let entries = [];
    const entriesFilePath = "./commands/giveaway/json/giveawayEntries.json";
    if (fs.existsSync(entriesFilePath)) {
      try {
        entries = JSON.parse(fs.readFileSync(entriesFilePath, "utf8"));
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    // Configure collector to manage button interactions
    const filter = (i) => i.customId === "enter";
    const collector = channel.createMessageComponentCollector({
      filter,
      time: durationMs,
    });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const userRoles = i.member.roles.cache;

      const embedReply = new EmbedBuilder();

      if (entries.includes(userId)) {
        embedReply
          .setColor("#FFC868")
          .setDescription("<:info:1286772089046700094> Ya estás participando en el sorteo");
      } else {
        let entriesQty = 1;
        if (roleMultiplier && userRoles.has(roleMultiplier)) entriesQty *= 2;

        for (let j = 0; j < entriesQty; j++) {
          entries.push(userId);
        }

        fs.writeFileSync(entriesFilePath, JSON.stringify(entries, null, 2));
        embedReply
          .setColor("#79E096")
          .setDescription("<:check:1286772042657566780> Te has inscrito correctamente. ¡Mucha suerte!");

        // Update embed message
        const updatedEmbed = new EmbedBuilder()
          .setColor("NotQuiteBlack")
          .setTitle(prize)
          .setDescription(
            `Finaliza: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${user.id}>\nEntradas: **${entries.length}**\nGanadores: **${winnersQty}**`
          )
          .setFooter({ text: `${endDate}` });

        await message.edit({ embeds: [updatedEmbed], components: [row] });
      }

      await i.reply({ embeds: [embedReply], ephemeral: true });
    });

    collector.on("end", async () => {
      if (entries.length === 0) {
        await channel.send("No hubo participantes en el sorteo.");
        return;
      }

      // Select winners based on having at least one of the specified roles
      const validEntries = entries.filter(userId => {
        const member = channel.guild.members.cache.get(userId);
        return member && winningRoles.some(roleId => member.roles.cache.has(roleId));
      });

      if (validEntries.length === 0) {
        await channel.send("No hay participantes válidos con los roles requeridos.");
        return;
      }

      const winners = new Set();
      while (winners.size < winnersQty && validEntries.length > 0) {
        const randomIndex = Math.floor(Math.random() * validEntries.length);
        const winnerID = validEntries[randomIndex];
        winners.add(winnerID);
        validEntries.splice(randomIndex, 1);
      }

      const winnersArray = Array.from(winners);
      const winnersMention = winnersArray.map(id => `<@${id}>`).join(", ");

      const finalEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(prize)
        .setDescription(
          `Finalizó: <t:${endTimestamp}:R> | (<t:${endTimestamp}:D>)\nOrganizador: <@${user.id}>\nEntradas: **${entries.length}**\nGanadores: **${winnersMention}**`
        )
        .setFooter({ text: `${endDate}` });

      await message.edit({ embeds: [finalEmbed], components: [] });

      const winnerMsg = winnersQty === 1
        ? `🎉 ¡Felicidades ${winnersMention}! Has ganado **${prize}**.`
        : `🎉 ¡Felicidades ${winnersMention}! Han ganado **${prize}**.`;

      await channel.send(winnerMsg);
    });
  },
};
