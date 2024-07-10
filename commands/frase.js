const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("frase")
    .setDescription("Muestra una cita inspiradora aleatoria."),

  async execute(interaction) {
    const quotesPath = path.join(__dirname, "../json/quotes.json");

    try {
      // Leer el archivo quotes.json de manera asíncrona
      const data = await fs.readFile(quotesPath, "utf8");
      const quotes = JSON.parse(data);

      // Seleccionar una cita aleatoria
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      // Construir el embed con la cita
      const embed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setDescription(`${randomQuote} 💭`);

      // Enviar la cita como respuesta al usuario
      await interaction.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error("Error leyendo el archivo de citas:", error);
      await interaction.reply("Hubo un error al intentar obtener una cita.");
    }
  },
};
