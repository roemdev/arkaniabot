const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Añade o quita un rol a un usuario o a todos los miembros.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option
        .setName("acción")
        .setDescription("Acción a realizar: añadir o remover el rol.")
        .setRequired(true)
        .addChoices(
          { name: "Añadir", value: "add" },
          { name: "Remover", value: "remove" }
        )
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("El rol que deseas añadir o remover.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("opción")
        .setDescription("Aplica el cambio a un usuario o a todos los miembros.")
        .setRequired(true)
        .addChoices(
          { name: "Usuario", value: "usuario" },
          { name: "Todos", value: "all" }
        )
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que deseas aplicar el cambio (solo si elegiste 'usuario').")
    ),

  async execute(interaction) {
    const { options, guild, member } = interaction;

    // Opciones del comando
    const action = options.getString("acción");
    const role = options.getRole("rol");
    const option = options.getString("opción");
    const user = options.getUser("usuario");

    // Verificar permisos
    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: "No tienes permisos para gestionar roles.",
        ephemeral: true,
      });
    }

    // Verificar jerarquía del rol
    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: "No puedo gestionar este rol debido a su jerarquía.",
        ephemeral: true,
      });
    }

    // Ejecutar la acción
    if (option === "usuario") {
      // Añadir o remover el rol a un usuario específico
      if (!user) {
        return interaction.reply({
          content: "Debes seleccionar un usuario para esta opción.",
          ephemeral: true,
        });
      }

      const targetMember = guild.members.cache.get(user.id);
      if (!targetMember) {
        return interaction.reply({
          content: "No se encontró al usuario en este servidor.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder().setColor(action === "add" ? "#79E096" : "#F87171");
      if (action === "add") {
        if (targetMember.roles.cache.has(role.id)) {
          embed.setDescription(`El usuario <@${user.id}> ya tiene el rol **${role.name}**.`);
        } else {
          await targetMember.roles.add(role);
          embed.setDescription(`<:check:1313237490395648021> Se **añadió** el rol **${role.name}** a <@${user.id}>.`);
        }
      } else if (action === "remove") {
        if (!targetMember.roles.cache.has(role.id)) {
          embed.setDescription(`El usuario <@${user.id}> no tiene el rol **${role.name}**.`);
        } else {
          await targetMember.roles.remove(role);
          embed.setDescription(`<:check:1313237490395648021> Se **removió** el rol **${role.name}** de <@${user.id}>.`);
        }
      }

      return interaction.reply({ embeds: [embed], ephemeral: false });

    } else if (option === "all") {
      // Añadir o remover el rol a todos los miembros
      const members = await guild.members.fetch();
      const embed = new EmbedBuilder().setColor("#79E096");

      let affectedMembers = 0;
      for (const member of members.values()) {
        if (action === "add" && !member.roles.cache.has(role.id)) {
          await member.roles.add(role).catch(() => null);
          affectedMembers++;
        } else if (action === "remove" && member.roles.cache.has(role.id)) {
          await member.roles.remove(role).catch(() => null);
          affectedMembers++;
        }
      }

      embed.setDescription(
        `<:check:1313237490395648021> Se ha ${action === "add" ? "**añadido**" : "**removido**"} el rol **${role.name}** ${affectedMembers > 0 ? `a ${affectedMembers} miembro(s).` : "pero no hubo cambios."}`
      );

      return interaction.reply({ embeds: [embed] });
    }
  },
};