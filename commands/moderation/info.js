const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Comandos informativos.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("avatar")
        .setDescription("Muestra el avatar de un usuario.")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("El usuario del que quieres ver el avatar.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("usuario")
        .setDescription("Muestra información sobre un usuario.")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("El usuario del que quieres ver la información.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("servidor")
        .setDescription("Muestra información sobre el servidor.")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("ping").setDescription("Muestra la latencia del bot.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "avatar") {
      const user = interaction.options.getUser("usuario") || interaction.user;

      const avatarEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setDescription(`Avatar de **${user.tag}**`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setTimestamp();

      await interaction.reply({ embeds: [avatarEmbed], ephemeral: false });
    } else if (subcommand === "usuario") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id);

      const roles =
        member.roles.cache
          .filter((role) => role.id !== interaction.guild.id) // Filtrar el rol @everyone
          .sort((a, b) => b.position - a.position) // Ordenar roles de más alto a más bajo
          .map((role) => role.toString())
          .join("\n`-`") || "Ninguno";

      const userInfoEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(`Información de Usuario`)
        .addFields(
          {
            name: "General",
            value: `>>> **Usuario:** ${user.username}\n**ID:** \`${
              user.id
            }\`\n**Mención:** <@${user.id}>\n**Creada:** <t:${Math.floor(
              user.createdTimestamp / 1000
            )}:R>\n**[Avatar](${user.displayAvatarURL({
              dynamic: true,
              size: 4096,
            })})**`,
          },
          {
            name: "Servidor",
            value: `>>> **Ingreso:** <t:${Math.floor(
              member.joinedTimestamp / 1000
            )}:R>\n**Rol:** ${member.roles.highest}`,
          },
          {
            name: "Roles",
            value: `>>> \`-\` ${roles}`,
          }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

      await interaction.reply({ embeds: [userInfoEmbed], ephemeral: false });
    } else if (subcommand === "servidor") {
      const guild = interaction.guild;

      const serverInfoEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(`Información del Servidor`)
        .addFields({
          name: `${guild.name}`,
          value: `>>> **ID**: \`${guild.id}\`\n${guild.description}`,
          inline: true,
        })
        .addFields({
          name: "Detalles",
          value: `>>> Miembros: \`${guild.memberCount}\`\nBoosts: \`${
            guild.premiumSubscriptionCount
          }\`\nCreación: <t:${Math.floor(
            guild.createdTimestamp / 1000
          )}:R>\nPropietario: <@${guild.ownerId}>\nReglas: <#${
            guild.rulesChannelId
          }>`,
          inline: true,
        })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

      await interaction.reply({ embeds: [serverInfoEmbed], ephemeral: false });
    } else if (subcommand === "ping") {
      const botLatency = Date.now() - interaction.createdTimestamp;
      const apiLatency = interaction.client.ws.ping * 1000;

      const pingEmbed = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle("Pong! :ping_pong:")
        .setDescription(
          `**Bot:** \`${botLatency}\`\n**API:** \`${apiLatency}\``
        )
        .setTimestamp();

      await interaction.reply({ embeds: [pingEmbed], ephemeral: false });
    }
  },
};
