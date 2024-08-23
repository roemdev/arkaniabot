const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sorteo")
    .setDescription("Inicia un nuevo sorteo")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("sorteoModal")
      .setTitle("Crear Sorteo");

    const duracionInput = new TextInputBuilder()
      .setCustomId("duracion")
      .setLabel("Duración del Sorteo (Formato: 1m, 1h, 1d)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const premioInput = new TextInputBuilder()
      .setCustomId("premio")
      .setLabel("Premio del Sorteo")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ganadoresInput = new TextInputBuilder()
      .setCustomId("ganadores")
      .setLabel("Número de Ganadores")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(duracionInput);
    const secondActionRow = new ActionRowBuilder().addComponents(premioInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(ganadoresInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);
  },

  async handleModalSubmit(interaction) {
    if (interaction.customId !== "sorteoModal") return;

    const organizador = interaction.user.id;
    const duracion = interaction.fields.getTextInputValue("duracion");
    const premio = interaction.fields.getTextInputValue("premio");
    const numeroGanadores = parseInt(
      interaction.fields.getTextInputValue("ganadores"),
      10
    );

    function convertirDuracion(duracion) {
      const unidad = duracion.slice(-1);
      const cantidad = parseInt(duracion.slice(0, -1), 10);

      if (isNaN(cantidad)) return null;

      switch (unidad) {
        case "m":
          return cantidad * 60 * 1000;
        case "h":
          return cantidad * 60 * 60 * 1000;
        case "d":
          return cantidad * 24 * 60 * 60 * 1000;
        default:
          return null;
      }
    }

    const duracionMs = convertirDuracion(duracion);

    if (duracionMs === null) {
      return interaction.reply({
        content: "Duración inválida. Usa formatos como `1m`, `1h`, `1d`.",
        ephemeral: true,
      });
    }

    const finalizaTimestamp = Math.floor((Date.now() + duracionMs) / 1000);
    const fechaFinalizacion = new Date(finalizaTimestamp * 1000)
      .toLocaleDateString("es-ES")
      .replace(/\//g, "/");

    const filePath = "./json/inscritos.json";
    let inscritos = [];

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      try {
        inscritos = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    if (!Array.isArray(inscritos)) {
      inscritos = [];
    }

    const inscribirmeButton = new ButtonBuilder()
      .setCustomId("inscribirme")
      .setLabel(" ")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎉");

    const termsButton = new ButtonBuilder()
      .setCustomId("terms")
      .setLabel("Términos")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(inscribirmeButton, termsButton);

    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle(premio)
      .setDescription(
        `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizador: <@${organizador}>\nParticipaciones: **${inscritos.length}**\nGanadores: **${numeroGanadores}**`
      )
      .setFooter({ text: `${fechaFinalizacion}` });

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "-# Sorteo creado",
      ephemeral: true,
    });

    const filter = (i) => i.customId === "inscribirme" || i.customId === "terms";
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: duracionMs,
    });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const userRoles = i.member.roles.cache;
      const embedReply = new EmbedBuilder();

      if (i.customId === "terms") {
        const termsEmbed = new EmbedBuilder()
          .setColor("NotQuiteBlack")
          .setTitle("Términos del Sorteo")
          .setDescription("Para inscribirte en el sorteo necesitarás comprar una entrada.\nSi eres membro VIP tendrás dos participaciones en lugar de una.\nSi eres miembro Diamante tendrás 3.");

        await i.reply({ embeds: [termsEmbed], ephemeral: true });
        return;
      }

      if (i.customId === "inscribirme") {
        if (!userRoles.has("1276571444096012298")) {
          embedReply
            .setColor("#F87171")
            .setDescription("Para inscribirte en el sorteo debes de comprar una entrada.");
          await i.reply({ embeds: [embedReply], ephemeral: true });
          return;
        }

        if (inscritos.includes(userId)) {
          embedReply
            .setColor("#79E096")
            .setDescription("¡Ya estás participando!");
        } else {
          let participaciones = 1;

          if (userRoles.has("1276571474488201323")) {
            participaciones += 1;
          }
          if (userRoles.has("1276571491210887168")) {
            participaciones += 2;
          }

          for (let j = 0; j < participaciones; j++) {
            inscritos.push(userId);
          }

          fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
          embedReply
            .setColor("#79E096")
            .setDescription("¡Te has inscrito correctamente!");

          const updatedEmbed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle(premio)
            .setDescription(
              `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizador: <@${organizador}>\nParticipaciones: **${inscritos.length}**\nGanadores: **${numeroGanadores}**`
            )
            .setFooter({ text: `${fechaFinalizacion}` });

          await message.edit({ embeds: [updatedEmbed], components: [row] });
        }
        await i.reply({ embeds: [embedReply], ephemeral: true });
      }
    });

    collector.on("end", async () => {
      if (inscritos.length === 0) {
        await interaction.channel.send("No hubo participantes en el sorteo.");
        return;
      }

      const ganadores = new Set(); // Usar un Set para asegurar ganadores únicos

      while (ganadores.size < numeroGanadores && inscritos.length > 0) {
        const randomIndex = Math.floor(Math.random() * inscritos.length);
        const ganadorId = inscritos[randomIndex];
        ganadores.add(ganadorId); // Usar el Set para evitar duplicados
        inscritos.splice(randomIndex, 1);
      }

      const ganadoresArray = Array.from(ganadores); // Convertir el Set a Array para facilitar el manejo
      const ganadoresMention = ganadoresArray.map((id) => `<@${id}>`).join(", ");

      const finalEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(premio)
        .setDescription(
          `Finalizó: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizador: <@${organizador}>\nParticipaciones: **${inscritos.length + ganadoresArray.length}**\nGanadores: **${ganadoresMention}**`
        )
        .setFooter({ text: `${fechaFinalizacion}` });

      await message.edit({ embeds: [finalEmbed], components: [] });

      if (numeroGanadores == 1) {
        winnerMsg = `¡Felicidades ${ganadoresMention}! ¡Eres has ganado el sorteo!`
      } else {
        winnerMsg = `¡Felicidades ${ganadoresMention}! ¡Son lo ganadores del sorteo!`
      }

      await interaction.channel.send(winnerMsg);

      fs.writeFileSync(filePath, "[]");
    });

  },
};
