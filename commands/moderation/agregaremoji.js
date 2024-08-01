const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("agregaremoji")
    .setDescription("Agrega un emoji al servidor desde un enlace")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("La URL de la imagen del emoji")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("El nombre del emoji")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .setDMPermission(false),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    const nombre = interaction.options.getString("nombre");

    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageGuildExpressions
      )
    ) {
      return interaction.reply("No tienes permisos para gestionar emojis.");
    }

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: url,
        name: nombre,
      });
      const embed = new EmbedBuilder()
        .setColor("#79E096")
        .setTitle(" ")
        .setDescription(`Emoji creado correctamente: ${emoji}`);

      // Responder con el embed
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply("Hubo un error al intentar crear el emoji.");
    }
  },
};
