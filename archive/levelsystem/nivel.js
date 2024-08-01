const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/database");
const {
  calcularNivel,
  experienciaParaSiguienteNivel,
  crearBarraProgreso,
} = require("./levelUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nivel")
    .setDescription("Consulta tu nivel y puntos de experiencia")
    .addUserOption((option) =>
      option.setName("user").setDescription("El usuario para consultar el nivel")
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    db.get(`SELECT * FROM users WHERE user_id = ?`, [user.id], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply({
          content: "Hubo un error al obtener la información del usuario.",
          ephemeral: true,
        });
      }

      if (!row) {
        return interaction.reply({
          content: "Este usuario no ha ganado experiencia aún.",
          ephemeral: true,
        });
      }

      const expNecesaria = experienciaParaSiguienteNivel(row.experience);
      const { barra, porcentaje } = crearBarraProgreso(
        row.experience,
        expNecesaria
      );

      const embed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(`Nivel de experiencia de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields({
          name: "Nivel",
          value: `**Nivel ${row.level}**`,
          inline: true,
        })
        .addFields({
          name: "Experiencia",
          value: `${row.experience}/${expNecesaria}`,
          inline: true,
        })
        .addFields({
          name: "Progreso",
          value: `${barra} ${porcentaje.toFixed(2)}%`,
          inline: false,
        });

      interaction.reply({ embeds: [embed] });
    });
  },
};
