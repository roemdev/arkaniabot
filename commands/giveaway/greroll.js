const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("greroll")
    .setDescription("Vuelve a seleccionar los ganadores de un sorteo existente.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(option =>
      option
        .setName("message_id")
        .setDescription("El ID del mensaje del sorteo.")
        .setRequired(true)
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
    const filePath = "./json/inscritos.json";
    let inscritos = [];

    try {
      // Leer la lista de inscritos desde el archivo JSON
      if (fs.existsSync(filePath)) {
        inscritos = JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return interaction.reply({
        content: "Error al leer la lista de inscritos.",
        ephemeral: true
      });
    }

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

      // Reelegir ganadores
      const numeroGanadores = parseInt(embed.description.match(/Ganadores: \*\*(\d+)\*\*/)[1]);
      const ganadores = new Set();

      while (ganadores.size < numeroGanadores && inscritos.length > 0) {
        const randomIndex = Math.floor(Math.random() * inscritos.length);
        const ganadorId = inscritos[randomIndex];
        ganadores.add(ganadorId);
        inscritos.splice(randomIndex, 1); // Elimina el ganador de la lista de inscritos
      }

      const ganadoresArray = Array.from(ganadores);
      const ganadoresMention = ganadoresArray.map(id => `<@${id}>`).join(", ");

      // Actualizar el embed del mensaje
      const updatedEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(embed.title)
        .setDescription(
          `Finalizó: <t:${Math.floor(Date.now() / 1000)}:R>\nOrganizador: <@${interaction.user.id}>\nParticipaciones: **${inscritos.length + ganadoresArray.length}**\nGanadores: **${ganadoresMention}**`
        )
        .setFooter({ text: "Ganadores reelegidos" });

      await message.edit({ embeds: [updatedEmbed], components: [] });

      // Anunciar los ganadores
      const winnerMsg =
        numeroGanadores === 1
          ? `¡Felicidades ${ganadoresMention}! Has ganado **${embed.title}**. 🎉`
          : `¡Felicidades ${ganadoresMention}! Han ganado **${embed.title}**. 🎉`;

      await interaction.reply({
        content: winnerMsg,
        ephemeral: false
      });

      // Actualizar la lista de inscritos en el archivo JSON
      fs.writeFileSync(filePath, JSON.stringify(inscritos, null, 2));

    } catch (error) {
      console.error("Error al reelegir ganadores:", error);
      await interaction.reply({
        content: "No se pudo encontrar el mensaje o algo salió mal al reelegir los ganadores.",
        ephemeral: true
      });
    }
  },
};
