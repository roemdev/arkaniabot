const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/database");
const { manejarExperienciaYRoles } = require("./xpManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addxp")
    .setDescription("Add experience to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add experience to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of experience to add")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (amount <= 0) {
      return interaction.reply({
        content: "La cantidad de experiencia debe ser positiva.",
        ephemeral: true,
      });
    }

    manejarExperienciaYRoles(interaction, user.id, amount);

    interaction.reply({
      content: `Se han añadido ${amount} puntos de experiencia a ${user.username}.`,
      ephemeral: true,
    });
  },
};
