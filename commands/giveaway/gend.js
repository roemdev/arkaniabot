const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gend")
    .setDescription("Finaliza un sorteo.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(option =>
      option.setName("message_id")
        .setDescription("ID del mensaje del sorteo.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "No tienes permisos para ejecutar este comando.",
        ephemeral: true
      });
    }

    const messageId = interaction.options.getString("message_id");
    const filePath = "./json/inscritos.json";
    let inscritos = [];

    if (fs.existsSync(filePath)) {
      try {
        inscritos = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    try {
      const message = await interaction.channel.messages.fetch(messageId);
      const embed = message.embeds[0];

      if (!embed || !embed.title) {
        return interaction.reply({
          content: "El mensaje especificado no es un sorteo válido.",
          ephemeral: true
        });
      }

      // Verificar si el sorteo ya ha finalizado
      if (embed.description.includes("Finalizado")) {
        return interaction.reply({
          content: "Este sorteo ya ha sido finalizado.",
          ephemeral: true
        });
      }

      // Seleccionar ganadores únicos
      const numeroGanadores = parseInt(embed.description.match(/Ganadores: \*\*(\d+)\*\*/)[1], 10);
      const ganadores = new Set();
      while (ganadores.size < numeroGanadores && inscritos.length > 0) {
        const randomIndex = Math.floor(Math.random() * inscritos.length);
        const ganadorId = inscritos[randomIndex];
        ganadores.add(ganadorId);
        inscritos.splice(randomIndex, 1);
      }

      const ganadoresArray = Array.from(ganadores);
      const ganadoresMention = ganadoresArray.map(id => `<@${id}>`).join(", ");

      const finalEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(embed.title)
        .setDescription(`Finalizó: <t:${Math.floor(Date.now() / 1000)}:R> | (<t:${Math.floor(Date.now() / 1000)}:D>)\nOrganizador: <@${interaction.user.id}>\nParticipaciones: **${inscritos.length + ganadoresArray.length}**\nGanadores: **${ganadoresMention}**\nFinalizado`)
        .setFooter({ text: embed.footer.text });

      await message.edit({ embeds: [finalEmbed], components: [] });
      await interaction.channel.send(`¡Felicidades ${ganadoresMention}! ¡Son los ganadores del sorteo!`);

      fs.writeFileSync(filePath, "[]"); // Limpiar el archivo JSON

      await interaction.reply({
        content: "El sorteo ha finalizado y los ganadores han sido anunciados.",
        ephemeral: true
      });

    } catch (error) {
      console.error("Error al finalizar el sorteo:", error);
      await interaction.reply({
        content: "No se pudo encontrar el mensaje o algo salió mal al finalizar el sorteo.",
        ephemeral: true
      });
    }
  },
};
