const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
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
    .addRoleOption(option =>
      option
        .setName("required_role")
        .setDescription("Rol necesario para participar (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Variables configurables
    const DOUBLE_ENTRY_ROLES = ["1241182617504579594", "1303816942326648884"];

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
    const requiredRole = options.getRole("required_role");

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
      .setStyle(ButtonStyle.Primary)
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
      .setDescription("<:check:1313237490395648021> Sorteo creado exitosamente.");

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

        // Verificar requisitos para participar
        if (requiredRole && !userRoles.has(requiredRole.id)) {
          embedReply
            .setColor("#F87171")
            .setDescription(`<:deny:1313237501359558809> No has comprado una entrada para este sorteo.`);
          return await i.reply({ embeds: [embedReply], ephemeral: true });
        }

        // Verificar si ya está inscrito
        if (entries.includes(userId)) {
          embedReply
            .setColor("#FFC868")
            .setDescription("<:advise:1313237521634689107> ¡Ya estás participando en el sorteo!");
        } else {
          // Añadir entradas según roles
          let entriesQty = 1;
          if (DOUBLE_ENTRY_ROLES.some(role => userRoles.has(role))) entriesQty *= 2;

          for (let j = 0; j < entriesQty; j++) {
            entries.push(userId);
          }

          embedReply
            .setColor("#79E096")
            .setDescription("<:check:1313237490395648021> ¡Te has inscrito correctamente!");

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
          .setDescription(
            `Requisitos para participar:\n${
              requiredRole ? `- Haber comprado la entrada.\n` : ""
            }- Comprar la entrada (con monedas).\n\nBeneficios adicionales:\n- Los roles ${DOUBLE_ENTRY_ROLES.map(
              (role) => `<@&${role}>`
            ).join(" y ")} otorgan el doble de entradas (no acumulable).\n\n> Si ganas, tendrás 24 horas para contactar al organizador.`
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
      const winners = new Set();
      while (winners.size < winnersQty && entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winnerID = entries[randomIndex];
        winners.add(winnerID);
        entries.splice(randomIndex, 1);
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
        ? `🎉 ¡Felicidades ${winnersMention}! Has ganado el sorteo.`
        : `🎉 ¡Felicidades ${winnersMention}! Han ganado el sorteo.`;

      await channel.send(winnerMsg);
    });
  },
};
