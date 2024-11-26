const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");

const MAX_MEMBERS_PER_TEAM = 5; // Máximo de miembros por equipo

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .setName("equiposclash")
    .setDescription("Configura los equipos para el Clash de League of Legends.")
    .addStringOption(option =>
      option
        .setName("roles")
        .setDescription("Lista de roles de equipos, separados por comas (IDs o nombres).")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { options, guild, channel } = interaction;

    // Responder de forma efímera al ejecutor para confirmar el comando
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#79E096")
          .setDescription("<:check:1286772042657566780> Equipos enviados")
      ],
      ephemeral: true,
    });

    const rolesInput = options.getString("roles");
    const roleIdentifiers = rolesInput.split(",").map(role => role.trim());

    const roles = [];
    for (const identifier of roleIdentifiers) {
      const role =
        guild.roles.cache.get(identifier) ||
        guild.roles.cache.find(r => r.name === identifier);

      if (role) roles.push(role);
    }

    if (roles.length === 0) {
      return channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#F87171")
            .setDescription("<:decline:1286772064765743197> No se encontraron roles válidos. Asegúrate de ingresar IDs o nombres correctos."),
        ],
      });
    }

    // Función para generar botones actualizados
    const generateButtons = () => {
      return new ActionRowBuilder().addComponents(
        roles.map(role => {
          const membersInRole = role.members.size;
          const availableSpots = MAX_MEMBERS_PER_TEAM - membersInRole;
          return new ButtonBuilder()
            .setCustomId(`team_${role.id}`)
            .setLabel(`${role.name} (${membersInRole}/${MAX_MEMBERS_PER_TEAM})`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(availableSpots <= 0); // Deshabilitar el botón si el equipo está lleno
        })
      );
    };

    const embed = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle("¡Bienvenidos a la categoría CLASH!")
      .setDescription("Esta sección está dedicada a organizar los equipos para el evento CLASH del League of Legends. Los equipos tienen cupo limitado así que ¡coordina con tus amigos para participar en el mismo equipo!")
      .addFields({ name: '¿Qué es el CLASH?', value: '> El Clash es un torneo dentro de League of Legends donde los equipos compiten en un formato organizado. Es una gran oportunidad para demostrar tus habilidades y disfrutar del juego en equipo.' })
      .addFields({ name: '¿Cómo funciona esta categoría?', value: '> Primero debes elegir el equipo en el que deseas participar (haz clic en los botones debajo). Una vez elijas tu equipo, tendrás acceso a sus canales exclusivos de texto y voz. Estos canales serán tu espacio para coordinar estrategias y comunicarte con tu equipo.' })
      .setImage("https://static.wikia.nocookie.net/leagueoflegends/images/d/d2/Clash_Title.png/revision/latest/scale-to-width-down/1000?cb=20190601061810")
      .setFooter({ text: '¿No hay más cupos? Solicita un nuevo equipo con Jedoth' });

    // Enviar el mensaje público con botones
    const mainMessage = await channel.send({ embeds: [embed], components: [generateButtons()] });

    // Configurar el colector de interacciones
    const filter = (i) =>
      roles.some(role => i.customId === `team_${role.id}`) || // Interacción con los botones de equipos
      i.customId.startsWith("abandon_") || // Interacción para abandonar un equipo
      i.customId.startsWith("confirm_");  // Interacción para confirmar cambio de equipo

    const collector = channel.createMessageComponentCollector({ filter, time: 0 });

    collector.on("collect", async (i) => {
      const userRoles = i.member.roles.cache;
      const embedReply = new EmbedBuilder();

      const clickedRole = roles.find(role => i.customId === `team_${role.id}`);
      const currentRole = roles.find(role => userRoles.has(role.id));

      if (clickedRole) {
        const membersInRole = clickedRole.members.size;
        if (membersInRole >= MAX_MEMBERS_PER_TEAM) {
          embedReply
            .setColor("#F87171")
            .setDescription(`<:info:1286772089046700094> El equipo **${clickedRole.name}** ya está lleno. (${MAX_MEMBERS_PER_TEAM}/${MAX_MEMBERS_PER_TEAM})`);
          return await i.reply({ embeds: [embedReply], ephemeral: true });
        }

        if (currentRole?.id === clickedRole.id) {
          embedReply
            .setColor("#FFC868")
            .setDescription(`<:info:1286772089046700094> Ya perteneces al equipo **${clickedRole.name}**.`);

          const abandonButton = new ButtonBuilder()
            .setCustomId(`abandon_${clickedRole.id}`)
            .setLabel("Abandonar equipo")
            .setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder().addComponents(abandonButton);
          return await i.reply({ embeds: [embedReply], components: [row], ephemeral: true });
        }

        if (currentRole) {
          embedReply
            .setColor("#FFC868")
            .setDescription(
              `<:info:1286772089046700094> Ya perteneces al equipo **${currentRole.name}**. ¿Quieres cambiarte al equipo **${clickedRole.name}**?`
            );

          const confirmButton = new ButtonBuilder()
            .setCustomId(`confirm_${clickedRole.id}`)
            .setLabel(`Cambiarme a ${clickedRole.name}`)
            .setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder().addComponents(confirmButton);
          return await i.reply({ embeds: [embedReply], components: [row], ephemeral: true });
        }

        await i.member.roles.add(clickedRole);
        embedReply
          .setColor("#79E096")
          .setDescription(`<:check:1286772042657566780> ¡Te has unido al equipo **${clickedRole.name}**! (${membersInRole + 1}/${MAX_MEMBERS_PER_TEAM})`);
        await i.reply({ embeds: [embedReply], ephemeral: true });

        // Actualizar los botones con los nuevos cupos
        await mainMessage.edit({ components: [generateButtons()] });
      } else if (i.customId.startsWith("abandon_")) {
        const targetRoleId = i.customId.split("_")[1];
        const targetRole = roles.find(role => role.id === targetRoleId);

        if (!currentRole || currentRole.id !== targetRole.id) {
          embedReply
            .setColor("#FFC868")
            .setDescription("<:info:1286772089046700094> No perteneces a este equipo.");
          return await i.reply({ embeds: [embedReply], ephemeral: true });
        }

        await i.member.roles.remove(targetRole);
        embedReply
          .setColor("#79E096")
          .setDescription(`<:check:1286772042657566780> Has abandonado el equipo **${targetRole.name}**.`);

        await i.reply({ embeds: [embedReply], ephemeral: true });

        // Actualizar los botones con los nuevos cupos
        await mainMessage.edit({ components: [generateButtons()] });
      } else if (i.customId.startsWith("confirm_")) {
        const targetRoleId = i.customId.split("_")[1];
        const targetRole = roles.find(role => role.id === targetRoleId);

        const membersInRole = targetRole.members.size;
        if (membersInRole >= MAX_MEMBERS_PER_TEAM) {
          embedReply
            .setColor("#F87171")
            .setDescription(`<:info:1286772089046700094> El equipo **${targetRole.name}** ya está lleno. (${MAX_MEMBERS_PER_TEAM}/${MAX_MEMBERS_PER_TEAM})`);
          return await i.reply({ embeds: [embedReply], ephemeral: true });
        }

        if (currentRole) await i.member.roles.remove(currentRole);
        await i.member.roles.add(targetRole);

        embedReply
          .setColor("#79E096")
          .setDescription(`<:check:1286772042657566780> Has cambiado al equipo **${targetRole.name}**. (${membersInRole + 1}/${MAX_MEMBERS_PER_TEAM})`);

        await i.reply({ embeds: [embedReply], ephemeral: true });

        // Actualizar los botones con los nuevos cupos
        await mainMessage.edit({ components: [generateButtons()] });
      }
    });
  },
};
