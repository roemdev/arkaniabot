const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Envía la lista de roles en Arkania.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('NotQuiteBlack')
            .setTitle('Roles en Arkania')
            .setDescription('Aquí tienes la lista de los roles en Arkania.')
            .addFields(
                { name: 'Roles principales', value:
                '* <@&991405352660779028> Fundador del gremio.\n* <@&1251292331852697623> Sub-fundador del gremio.\n* <@&991490018151514123> Segundos al mendo.\n* <@&1247613884458729575> Nuevos en el gremio.'},
                { name: 'Roles por nivel', value: '* <@&1247699315908935680> Nivel 45.\n* <@&1251306364878458931> Nivel 35.\n* <@&1234893710588645426> Nivel 25.\n* <@&1247707042492452944> Nivel 15.\n* <@&1215767915329228890> Nivel 5.'}
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};