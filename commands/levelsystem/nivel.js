const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nivel")
    .setDescription("Check your level and experience points"),
  async execute(interaction) {
    const { user } = interaction;

    db.get(`SELECT * FROM users WHERE user_id = ?`, [user.id], (err, row) => {
      if (err) return console.error(err);
      if (!row) {
        interaction.reply("You have no experience yet.");
      } else {
        const nextLevelExp = row.level * 100;
        const expToNextLevel = nextLevelExp - row.experience;
        interaction.reply(
          `You are level ${row.level} with ${row.experience} experience points. You need ${expToNextLevel} more experience points to reach the next level.`
        );
      }
    });
  },
};
