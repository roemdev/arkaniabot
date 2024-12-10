const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .setName("purge")
    .setDescription("Elimina mensajes en un canal.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a eliminar (máximo: 1000).")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Elimina mensajes únicamente de este usuario.")
    ),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");
    const usuario = interaction.options.getUser("usuario");

    if (cantidad < 1 || cantidad > 1000) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFC868")
            .setDescription(
              "<:info:1313237490395648021> La cantidad debe estar entre 1 y 1000 mensajes."
            ),
        ],
        ephemeral: true,
      });
    }

    let messagesToDelete = [];
    let totalMessagesFetched = 0;
    let lastMessageId;

    while (totalMessagesFetched < cantidad) {
      const fetchLimit = Math.min(cantidad - totalMessagesFetched, 100);
      const fetchedMessages = await interaction.channel.messages.fetch({
        limit: fetchLimit,
        ...(lastMessageId && { before: lastMessageId }),
      });

      if (fetchedMessages.size === 0) break;

      const filteredMessages = usuario
        ? fetchedMessages.filter(msg => msg.author.id === usuario.id)
        : fetchedMessages;

      messagesToDelete = [...messagesToDelete, ...filteredMessages.values()];
      totalMessagesFetched += filteredMessages.size;
      lastMessageId = fetchedMessages.last()?.id;
    }

    const actualAmountToDelete = messagesToDelete.length;

    if (actualAmountToDelete === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFC868")
            .setDescription(
              usuario
                ? `<:info:1313237490395648021> No se encontraron mensajes de **${usuario.tag}** para eliminar.`
                : "<:info:1313237490395648021> No se encontraron mensajes para eliminar."
            ),
        ],
        ephemeral: true,
      });
    }

    const infoEmbed = new EmbedBuilder()
      .setColor("#79E096")
      .setDescription(
        `<:check:1313237490395648021> Se eliminarán \`${actualAmountToDelete}\` mensajes${
          usuario ? ` de **${usuario.tag}**` : ""
        }.`
      );

    const sentMessage = await interaction.reply({ embeds: [infoEmbed], fetchReply: true });

    let totalDeleted = 0;

    while (messagesToDelete.length > 0) {
      const batch = messagesToDelete.splice(0, 100).filter(msg => msg.id !== sentMessage.id);

      if (batch.length > 0) {
        try {
          await interaction.channel.bulkDelete(batch, true);
          totalDeleted += batch.length;
        } catch (error) {
          console.error("Error al eliminar los mensajes:", error);
          break;
        }
      }
    }

    if (totalDeleted < actualAmountToDelete) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFC868")
            .setDescription(
              `<:info:1313237490395648021> Se eliminaron ${totalDeleted} mensajes, pero algunos no pudieron ser eliminados debido a restricciones de Discord.`
            ),
        ],
        ephemeral: true,
      });
    }
  },
};
