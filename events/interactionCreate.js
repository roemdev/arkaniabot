const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isModalSubmit()) {
      const command = interaction.client.commands.get("sorteo");
      if (command && typeof command.handleModalSubmit === "function") {
        await command.handleModalSubmit(interaction);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select-color-role') {
        const selectedRole = interaction.values[0];
        const member = await interaction.guild.members.fetch(interaction.user.id);

        const roles = [
          '1288966787160870922', '1288966789698424832', '1288966791892176907', 
          '1288966797051166854', '1288966794115289308', '1288966794605760604', 
          '1288966793305522278', '1288966795868373002', '1288968686954221651'
        ];

        const confirmEmbed = new EmbedBuilder()
          .setColor('#79E096')
          .setDescription(`<:check:1286772042657566780> ¡Te pinté de color <@&${selectedRole}>!`);

        if (selectedRole === 'none') {
          // Si se selecciona "Remover color", eliminar todos los roles de color
          const rolesToRemove = member.roles.cache.filter(role => roles.includes(role.id));
          await member.roles.remove(rolesToRemove);
          await interaction.reply({ content: 'Se han eliminado todos los roles de color.', ephemeral: true });
        } else {
          // Si el usuario ya tiene el rol seleccionado, removerlo
          if (member.roles.cache.has(selectedRole)) {
            await member.roles.remove(selectedRole);
            await interaction.reply({ content: `El rol <@&${selectedRole}> ha sido removido.`, ephemeral: true });
          } else {
            // Remover otros roles de color antes de asignar el nuevo
            const rolesToRemove = member.roles.cache.filter(role => roles.includes(role.id));
            await member.roles.remove(rolesToRemove);

            // Asignar el nuevo rol
            await member.roles.add(selectedRole);
            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
          }
        }
      }
    }
  },
};
