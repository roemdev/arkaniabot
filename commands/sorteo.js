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
    // Verificar permisos
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true,
      });
    }

    // Crea un modal
    const modal = new ModalBuilder()
      .setCustomId("sorteoModal")
      .setTitle("Crear Sorteo");

    // Crea los campos de entrada para el modal
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

    // Agrega los campos de entrada al modal
    const firstActionRow = new ActionRowBuilder().addComponents(duracionInput);
    const secondActionRow = new ActionRowBuilder().addComponents(premioInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(ganadoresInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    // Muestra el modal al usuario
    await interaction.showModal(modal);
  },

  async handleModalSubmit(interaction) {
    if (interaction.customId !== "sorteoModal") return;

    const organizador = interaction.user.username; // Tomar el nombre del usuario que ejecuta el comando
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
          return cantidad * 60 * 1000; // minutos a milisegundos
        case "h":
          return cantidad * 60 * 60 * 1000; // horas a milisegundos
        case "d":
          return cantidad * 24 * 60 * 60 * 1000; // días a milisegundos
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

    const finalizaTimestamp = Math.floor((Date.now() + duracionMs) / 1000); // Timestamp en segundos

    const filePath = "./json/inscritos.json";
    let inscritos = [];

    // Manejo del archivo inscritos.json
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      try {
        inscritos = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    // Inicializar el archivo si está vacío o no existe
    if (!Array.isArray(inscritos)) {
      inscritos = [];
    }

    const inscribirmeButton = new ButtonBuilder()
      .setCustomId("inscribirme")
      .setLabel(" ")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎉");

    const row = new ActionRowBuilder().addComponents(inscribirmeButton);

    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle(premio)
      .setDescription(
        `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizado por: ${organizador}\nParticipantes **${inscritos.length}**\nGanadores: **${numeroGanadores}**`
      );

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    // Responder con un mensaje efímero
    await interaction.reply({
      content: "Sorteo creado :white_check_mark:",
      ephemeral: true,
    });

    const filter = (i) => i.customId === "inscribirme";
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: duracionMs,
    });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const embedReply = new EmbedBuilder();

      if (i.customId === "inscribirme") {
        if (inscritos.includes(userId)) {
          embedReply
            .setColor("NotQuiteBlack")
            .setDescription("Ya estás participando.");
        } else {
          inscritos.push(userId);
          fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
          embedReply
            .setColor("#79E096")
            .setDescription("¡Te has inscrito correctamente!");

          // Actualizar el embed original con el nuevo número de participantes
          const updatedEmbed = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle(premio)
            .setDescription(
              `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizado por: ${organizador}\nParticipantes **${inscritos.length}**\nGanadores: **${numeroGanadores}**`
            );

          await message.edit({ embeds: [updatedEmbed], components: [row] });
        }
        await i.reply({ embeds: [embedReply], ephemeral: true });
      }
    });

    collector.on("end", async () => {
      if (inscritos.length === 0) {
        await interaction.channel.send("No hay participantes en el sorteo.");
        return;
      }

      const ganadores = [];
      while (ganadores.length < numeroGanadores && inscritos.length > 0) {
        const randomIndex = Math.floor(Math.random() * inscritos.length);
        const ganadorId = inscritos[randomIndex];
        ganadores.push(ganadorId);
        inscritos.splice(randomIndex, 1); // Eliminar el ganador de la lista para evitar duplicados
      }

      // Editar el mensaje original para indicar los ganadores
      const updatedEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(premio)
        .setDescription(
          `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizado por: ${organizador}\nParticipantes **${
            inscritos.length
          }**\nGanadores: ${ganadores.map((id) => `<@${id}>`).join(", ")}`
        );

      await message.edit({ embeds: [updatedEmbed], components: [] });

      // Resetear los inscritos después de elegir a los ganadores
      inscritos = [];
      fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
    });
  },
};
