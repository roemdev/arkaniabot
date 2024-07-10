const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chiste")
    .setDescription("Cuenta un chiste al azar."),
  async execute(interaction) {
    const jokesPath = path.join(__dirname, "../json/jokes.json");

    // Leer el archivo jokes.json
    fs.readFile(jokesPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error leyendo el archivo de chistes:", err);
        return interaction.reply(
          "Hubo un error al intentar obtener un chiste."
        );
      }

      const jokes = JSON.parse(data);
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      // Crear el embed
      const embed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setDescription(`${randomJoke} 😂`);

      // Enviar el chiste
      interaction
        .reply({ embeds: [embed], allowedMentions: { repliedUser: false } })
        .catch((err) =>
          console.error("Error al enviar el comando chiste:", err)
        );
    });
  },
};
