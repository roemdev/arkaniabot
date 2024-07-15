const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sorteo")
    .setDescription("Inicia un nuevo sorteo")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption((option) =>
      option
        .setName("organizador")
        .setDescription("Nombre del organizador del sorteo")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duracion")
        .setDescription("Duración del sorteo (Formato: 1m, 1h, 1d)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("premio").setDescription("Premio del sorteo").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("ganadores")
        .setDescription("Número de ganadores")
        .setRequired(true)
    ),

  async execute(interaction) {
    const organizador = interaction.options.getString("organizador");
    const duracion = interaction.options.getString("duracion");
    const premio = interaction.options.getString("premio");
    const numeroGanadores = interaction.options.getInteger("ganadores");

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

    const terminosButton = new ButtonBuilder()
      .setCustomId("terminos")
      .setLabel("Términos")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📝");

    const row = new ActionRowBuilder().addComponents(inscribirmeButton, terminosButton);

    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle(premio)
      .setDescription(
        `Finaliza: <t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)\nOrganizado por: ${organizador}\nParticipantes **${inscritos.length}\n**Ganadores: **${numeroGanadores}**`
      );

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    // Responder con un mensaje efímero
    await interaction.reply({ content: "Sorteo creado :white_check_mark:", ephemeral: true });

    const filter = (i) => i.customId === "inscribirme" || i.customId === "terminos";
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: duracionMs });

    collector.on("collect", async (i) => {
      const userId = i.user.id;
      const embedReply = new EmbedBuilder();

      if (i.customId === "inscribirme") {
        if (inscritos.includes(userId)) {
          embedReply.setColor("NotQuiteBlack").setDescription("Ya estás participando.");
        } else {
          inscritos.push(userId);
          fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
          embedReply.setColor("#79E096").setDescription("¡Te has inscrito correctamente!");

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
      } else if (i.customId === "terminos") {
        const terminosEmbed = new EmbedBuilder()
          .setColor("NotQuiteBlack")
          .setTitle(" ")
          .setDescription("No hay términos específicos para este sorteo.");

        await i.reply({ embeds: [terminosEmbed], ephemeral: true });
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

      const ganadoresEmbed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("🎉 ¡Ganadores del Sorteo! 🎉")
        .setDescription(
          `¡Los ganadores del sorteo son ${ganadores.map((id) => `<@${id}>`).join(", ")}! Felicidades! 🎉`
        )
        .addFields({ name: "Premio", value: premio })
        .setTimestamp();

      await interaction.channel.send({ embeds: [ganadoresEmbed] });

      // Editar el mensaje original para indicar que el sorteo ha terminado
      const updatedEmbed = new EmbedBuilder(embed).setDescription("El sorteo ha terminado.");

      await message.edit({ embeds: [updatedEmbed], components: [] });

      // Resetear los inscritos después de elegir a los ganadores
      inscritos = [];
      fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));
    });
  },
};
