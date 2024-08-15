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
    const user = interaction.user.tag; // Obtenemos el nombre de usuario

    console.log(`Comando [ clear ] ejecutado por [ ${user} ].`);

    try {
      if (amount < 1 || amount > 99) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#F87171")
          .setTitle(" ")
          .setDescription(`Proporciona un número entre **\`1\`** y **\`99\`**`);

        return interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      await interaction.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor("#79E096")
        .setTitle(" ")
        .setDescription(`He eliminado **\`${amount}\`** mensajes.`);

      await interaction.reply({ embeds: [embed], ephemeral: true });

      console.log(
        `Se han eliminado [ ${amount} ] mensajes. Canal: [ ${interaction.channel.name} ]. Usuario: [ ${user} ].`
      );
    } catch (error) {
      console.error(
        `Error ejecutando el comando clear por ${user}: ${error.message}`
      );

      const errorEmbed = new EmbedBuilder()
        .setColor("#F87171")
        .setTitle(" ")
        .setDescription(
          "Hubo un error al intentar borrar los mensajes en este canal."
        );

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
