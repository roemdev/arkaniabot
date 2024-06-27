const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida')
        .setDescription('Bienvenido a Arkania'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setTitle('¡Bienvenido a Arkania!')
            .setDescription('Es un gusto tenerte por aquí. Antes de irte a los canales y socializar con todos los aldeanos te sugeriría que leas las normas. Si tienes problemas dirígete a <#1246490813383311522> y con gusto te ayudamos.')
            .setImage('https://cdn.discordapp.com/attachments/1242546852272930876/1247678669921714176/Diseno_sin_titulo.png?ex=667de7cf&is=667c964f&hm=3b19d05b7403a0d176db5f195c6325680b4f8ae60bb59c1e9bb48ae573b911be&')

        await interaction.reply({ embeds: [embed], ephemeral: false })
    },
};
