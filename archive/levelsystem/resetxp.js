const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetxp")
    .setDescription("Reset the experience of a user or all users")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to reset the experience of")
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");

    if (user) {
      // Reset experience for a specific user
      db.run(
        `UPDATE users SET experience = ?, level = ? WHERE user_id = ?`,
        [0, 1, user.id],
        (err) => {
          if (err) {
            console.error(err);
            interaction.reply({
              content: "Error resetting experience.",
              ephemeral: true,
            });
          } else {
            interaction.reply({
              content: `La experiencia de ${user.username} ha sido reiniciada.`,
              ephemeral: true,
            });
          }
        }
      );
    } else {
      // Reset experience for all users
      db.run(`UPDATE users SET experience = ?, level = ?`, [0, 1], (err) => {
        if (err) {
          console.error(err);
          interaction.reply({
            content: "Error resetting experience for all users.",
            ephemeral: true,
          });
        } else {
          interaction.reply({
            content: "La experiencia de todos los usuarios ha sido reiniciada.",
            ephemeral: true,
          });
        }
      });
    }
  },
};
