const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bienvenida')
        .setDescription('Bienvenido a Arkania'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('NotQuiteBlack')
            .setTitle('¡Bienvenido a Arkania!')
            .setDescription('Nos emociona que te unas a nuestro gremio. Te sugeriría pasar por estos canales antes de iniciar tu aventura entre nosotros.')
            .addFields(
                {name: '<#1128136414379397200>', value: 'Donde podrás encontrar todas las normas que nos rigen', inline: true },
                {name: '<#1178441808057995335>', value: 'Para mantenerte informado de todo lo que sucede en el Gremio', inline: true},
            )
            .setImage('https://cdn.discordapp.com/attachments/1242546852272930876/1247678669921714176/Diseno_sin_titulo.png?ex=667de7cf&is=667c964f&hm=3b19d05b7403a0d176db5f195c6325680b4f8ae60bb59c1e9bb48ae573b911be&')
            .setFooter({ text: 'Si necesitas ayuda, no dudes en solicitarla.', iconURL:'https://images-ext-1.discordapp.net/external/Fnfr9iSeUmChx_VLXbhjGKCl4vUBOPTT22ZVNF6Qi2Y/https/cdn.discordapp.com/avatars/1254796486718525481/e2640f36735a418645cba69ad06a580f.png?format=webp&quality=lossless' })

        await interaction.reply({ embeds: [embed], ephemeral: false })
    },
};