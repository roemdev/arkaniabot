const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Borra una cantidad específica de mensajes.")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("La cantidad de mensajes a borrar.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("cantidad");

    if (amount < 1 || amount > 99) {
      return interaction.reply({
        content: "Por favor, proporciona un número entre 1 y 100.",
        ephemeral: true,
      });
    }

    await interaction.channel.bulkDelete(amount, true).catch((error) => {
      console.error(error);
      return interaction.reply({
        content: "Hubo un error al intentar borrar los mensajes en este canal.",
        ephemeral: true,
      });
    });

    const embed = new EmbedBuilder()
      .setColor("#79E096")
      .setTitle(" ")
      .setDescription(`He borrado **${amount}** mensajes.`);

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
