const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp-lb")
    .setDescription("View the experience leaderboard"),
  async execute(interaction) {
    db.all(
      `SELECT * FROM users ORDER BY experience DESC LIMIT 10`,
      (err, rows) => {
        if (err) return console.error(err);
        if (rows.length === 0) {
          interaction.reply("No one has earned any experience yet.");
        } else {
          const leaderboard = rows
            .map(
              (row, index) =>
                `\`${index + 1}\`. <@${row.user_id}> • **Nivel ${row.level}**`
            )
            .join("\n");

          const embedlb = new EmbedBuilder()
            .setColor("NotQuiteBlack")
            .setTitle("Tabla de clasificación")
            .setDescription(leaderboard);
          interaction.reply({ embeds: [embedlb] });
        }
      }
    );
  },
};
