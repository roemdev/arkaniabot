const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('colors')
    .setDescription('Crea un mensaje de autoroles para elegir colores'),

  async execute(interaction) {
    const roles = [
      { label: 'Rojo', value: '1285988483361673279', emoji: '🔴' },
      { label: 'Azul', value: '1285988490047393882', emoji: '🔵' },
      { label: 'Verde', value: '1285988490735259729', emoji: '🟢' },
      { label: 'Amarillo', value: '1287041701260820532', emoji: '🟡' },
      { label: 'Morado', value: '1287041708684611667', emoji: '🟣' },
      { label: 'Naranja', value: '1287041710538489960', emoji: '🟠' },
      { label: 'Rosa', value: '1287041711188607088', emoji: '🌸' },
      { label: 'Cian', value: '1287041713608724544', emoji: '🔵' },
      { label: 'Negro', value: '1287042916363272203', emoji: '⚫' },
      // Añadimos la opción "Ninguno"
      { label: 'Ninguno', value: 'none', emoji: '❌' }
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-color-role')
      .setPlaceholder('Selecciona tu color')
      .addOptions(roles.map(role => ({
        label: role.label,
        value: role.value,
        emoji: role.emoji,
      })));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setColor('NotQuiteBlack')
      .setTitle('Elige tu color de rol')
      .setDescription(
        roles.map(role => `${role.emoji} - <@&${role.value}>`).join('\n').replace('<@&none>', '❌ - Ninguno')
      );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });

    const collector = interaction.channel.createMessageComponentCollector({ componentType: 3, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'select-color-role') {
        const selectedRole = i.values[0];
        const member = await i.guild.members.fetch(i.user.id);

        const roleIds = roles.map(role => role.value).filter(value => value !== 'none'); // Excluir "none"

        if (selectedRole === 'none') {
          // Si se selecciona "Ninguno", eliminamos todos los roles de color
          const rolesToRemove = member.roles.cache.filter(role => roleIds.includes(role.id));
          await member.roles.remove(rolesToRemove);
          await i.reply({ content: 'Se han eliminado todos los roles de color.', ephemeral: true });
        } else {
          // Si el miembro ya tiene el rol seleccionado, lo removemos
          if (member.roles.cache.has(selectedRole)) {
            await member.roles.remove(selectedRole);
            await i.reply({ content: `El rol <@&${selectedRole}> ha sido removido.`, ephemeral: true });
          } else {
            // Remover solo los roles de color, pero no afectar otros roles del usuario
            const rolesToRemove = member.roles.cache.filter(role => roleIds.includes(role.id));
            await member.roles.remove(rolesToRemove);

            // Asignar el nuevo rol
            await member.roles.add(selectedRole);
            await i.reply({ content: `Se te ha asignado el rol <@&${selectedRole}>.`, ephemeral: true });
          }
        }
      }
    });

    collector.on('end', collected => console.log(`Se recogieron ${collected.size} interacciones.`));
  },
};
