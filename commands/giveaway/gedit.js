const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

// Helper function to convert duration string to milliseconds
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gedit")
    .setDescription("Edita un sorteo existente.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(option =>
      option
        .setName("message_id")
        .setDescription("El ID del mensaje del sorteo.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("duracion")
        .setDescription("Nueva duración del sorteo (Formato: 1m, 1h, 1d).")
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName("premio")
        .setDescription("Nuevo premio del sorteo.")
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName("ganadores")
        .setDescription("Nuevo número de ganadores.")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Verifica permisos del usuario
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true
      });
    }

    const messageId = interaction.options.getString("message_id");
    const nuevaDuracion = interaction.options.getString("duracion");
    const nuevoPremio = interaction.options.getString("premio");
    const nuevoNumeroGanadores = interaction.options.getInteger("ganadores");

    try {
      // Obtener el mensaje del sorteo
      const message = await interaction.channel.messages.fetch(messageId);
      const embed = message.embeds[0];

      if (!embed || !embed.title) {
        return interaction.reply({
          content: "El mensaje especificado no es un sorteo válido.",
          ephemeral: true
        });
      }

      // Actualizar valores si se proporcionan
      const duracionMs = nuevaDuracion ? convertirDuracion(nuevaDuracion) : null;
      const finalizaTimestamp = duracionMs ? Math.floor((Date.now() + duracionMs) / 1000) : null;
      const fechaFinalizacion = finalizaTimestamp ? new Date(finalizaTimestamp * 1000).toLocaleDateString("es-ES") : null;

      const updatedEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(nuevoPremio || embed.title)
        .setDescription(
          `Finaliza: ${finalizaTimestamp ? `<t:${finalizaTimestamp}:R> | (<t:${finalizaTimestamp}:D>)` : embed.description.match(/Finaliza: (.+)/)[1]}\nOrganizador: <@${interaction.user.id}>\nParticipaciones: **${embed.description.match(/Participaciones: \*\*(\d+)\*\*/)[1]}**\nGanadores: **${nuevoNumeroGanadores || embed.description.match(/Ganadores: \*\*(\d+)\*\*/)[1]}**`
        )
        .setFooter({ text: `${fechaFinalizacion || embed.footer.text}` });

      await message.edit({ embeds: [updatedEmbed] });

      await interaction.reply({
        content: "¡El sorteo ha sido actualizado exitosamente!",
        ephemeral: true
      });

    } catch (error) {
      console.error("Error al editar el sorteo:", error);
      await interaction.reply({
        content: "No se pudo encontrar el mensaje o algo salió mal al editar el sorteo.",
        ephemeral: true
      });
    }
  },
};
