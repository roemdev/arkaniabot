const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gstart")
    .setDescription("Inicia un nuevo sorteo")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(option =>
      option
        .setName("duration")
        .setDescription("Duración del sorteo")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("winners")
        .setDescription("Cantidad de ganadores")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("prize")
        .setDescription("Premio")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("winning_roles")
        .setDescription("IDs de los roles que pueden ganar, separados por comas")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role_multiplier")
        .setDescription("Rol que da el doble de entradas a los miembros que lo tienen")
    ),

  async execute(interaction) {
    const { user, member, channel, options } = interaction;

    // Verificar permisos
    if (!member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando",
        ephemeral: true,
      });
    }

    // Obtener opciones del comando
    const duration = options.getString("duration");
    const prize = options.getString("prize");
    const winnersQty = options.getInteger("winners");
    const roleMultiplier = options.getRole("role_multiplier")?.id;
    const winningRoles = options.getString("winning_roles").split(",").map(role => role.trim());

    // Convertir duración a milisegundos usando `ms`
    const durationMs = ms(duration);
    if (!durationMs) {
      return interaction.reply({
        content: "Duración inválida. Usa formatos como `1m`, `1h`, `1d`.",
        ephemeral: true,
      });
    }

    // Calcular tiempo de finalización
    const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);
    const endDate = new Date(endTimestamp * 1000).toLocaleDateString("es-ES");

    // Botones
    const enterBtn = new ButtonBuilder()
      .setCustomId("enter")
      .setLabel(" ")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🎉");

    const requirementsBtn = new ButtonBuilder()
      .setCustomId("requirements")
      .setLabel("Condiciones")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(enterBtn, requirementsBtn);

    // Crear y enviar el embed inicial
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
      .setDescription("<:check:1286772042657566780> Sorteo creado exitosamente.");

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });

    // Participantes del sorteo
    let entries = [];

    // Configurar collector para manejar interacciones con botones
    const filter = (i) => ["enter", "requirements"].includes(i.customId);
    const collector = channel.createMessageComponentCollector({
      filter,
      time: durationMs,
    });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const userRoles = i.member.roles.cache;

      if (i.customId === "enter") {
        const embedReply = new EmbedBuilder();

        if (entries.includes(userId)) {
          embedReply
            .setColor("#FFC868")
            .setDescription("<:info:1286772089046700094> ¡Ya estás participando en el sorteo!");
        } else {
          let entriesQty = 1;
          if (roleMultiplier && userRoles.has(roleMultiplier)) entriesQty *= 2;

          for (let j = 0; j < entriesQty; j++) {
            entries.push(userId);
          }

          embedReply
            .setColor("#79E096")
            .setDescription("<:check:1286772042657566780> ¡Te has inscrito correctamente!");

          // Actualizar el embed principal
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
      } else if (i.customId === "requirements") {
        // Crear y enviar el embed con los requisitos
        const requirementsEmbed = new EmbedBuilder()
          .setColor("#FFC868")
          .setTitle("Condiciones del sorteo")
          .setDescription(`
            * Para ganar en este sorteo, necesitas ser <@&1284145913354522685> o superior.
            * El rol ${roleMultiplier} otorga el doble de entradas.`
          );

        await i.reply({ embeds: [requirementsEmbed], ephemeral: true });
      }
    });

    collector.on("end", async () => {
      if (entries.length === 0) {
        await channel.send("No hubo participantes en el sorteo.");
        return;
      }

      // Seleccionar ganadores
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