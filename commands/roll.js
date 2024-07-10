const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription(
      "Lanza uno o más dados de 6 caras. Especifica la cantidad de dados."
    )
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de dados a lanzar.")
        .setRequired(false)
    ),
  async execute(interaction) {
    let diceCount = interaction.options.getInteger("cantidad") || 1; // Cantidad de dados por defecto es 1

    // Validar que la cantidad de dados sea mayor que 0
    if (diceCount <= 0) {
      return interaction.reply({
        content: "Debes proporcionar una cantidad mayor a 0.",
        ephemeral: true,
      });
    }

    // Validar que la cantidad de dados no sea mayor a 5
    if (diceCount > 5) {
      const embed = new EmbedBuilder()
        .setColor("#F87171") // Color rojo para el error
        .setTitle("Error")
        .setDescription("No puedes lanzar más de 5 dados.");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Lanzar los dados
    const results = [];
    for (let i = 0; i < diceCount; i++) {
      const rollResult = Math.floor(Math.random() * 6) + 1;
      results.push(rollResult);
    }

    // Formatear los resultados para mostrarlos en el embed
    const resultsString = results.map((result) => `**${result}**`).join(", ");
    let description = `Lanzaste ${diceCount} dado${
      diceCount > 1 ? "s" : ""
    }, resultado${diceCount > 1 ? "s" : ""}: 🎲 ${resultsString}`;

    if (diceCount === 1) {
      description = `Lanzaste 1 dado, resultado: 🎲 ${resultsString}`;
    }

    // Embed
    const embed = new EmbedBuilder()
      .setColor("#79E096") // Color verde para los resultados
      .setTitle(" ")
      .setDescription(description);

    // Respuesta
    await interaction
      .reply({ embeds: [embed], ephemeral: false })
      .catch((err) => console.error("Error al enviar el comando /roll:", err));
  },
};
