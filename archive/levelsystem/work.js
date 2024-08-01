const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work and gain experience points"),
  async execute(interaction) {
    const { user } = interaction;
    const expGained = Math.floor(Math.random() * 10) + 1;

    db.get(`SELECT * FROM users WHERE user_id = ?`, [user.id], (err, row) => {
      if (err) return console.error(err);
      if (!row) {
        db.run(
          `INSERT INTO users (user_id, experience, level) VALUES (?, ?, ?)`,
          [user.id, expGained, 1]
        );
      } else {
        const newExp = row.experience + expGained;
        db.run(`UPDATE users SET experience = ? WHERE user_id = ?`, [
          newExp,
          user.id,
        ]);
      }
      interaction.reply(
        `You worked and earned ${expGained} experience points!`
      );
    });
  },
};
