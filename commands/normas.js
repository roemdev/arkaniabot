const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Embed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('normas')
        .setDescription('Envía las normas de Arkania.'),
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('NotQuiteBlack')
            .setTitle('📝 Normas de Arkania')
            .setDescription(' ')
            .addFields(
                {name: '***`NSFW`***', value: 'El contenido NSFW (para adultos) está estrictamente prohibido en todos los canales.', inline: true},
                {name: '***`PUBLICIDAD`***', value: 'Queda prohibida cualquier forma de publicidad de otros servidores.', inline: true},
                {name: '***`SPAM`***', value: 'No se permite enviar mensajes rápidamente con la intención de interrumpir el chat.', inline: true},
                {name: '***`ACOSO`***', value: 'Se prohíbe cualquier forma de acoso, incluido el chantaje, compartir o filtrar información personal.', inline: true},
                {name: '***`PIRATERÍA`***', value: 'No se permite compartir o promover software pirata, cracks, keygens, o cualquier otro contenido ilegal.', inline: true},
                {name: '***`DISCORD`***', value: 'Cumplir con los [TOS](https://discord.com/terms) y [Guidelines](https://discord.com/guidelines) de Discord.', inline: true}
            )
            .setFooter({ text: 'Normas actualizadas el 28/6/2024', iconURL:'https://images-ext-1.discordapp.net/external/aJTLXHYnpDaR7e-fXhmFwyeJpSw0b1Xhq9pwQfq_xW4/%3Fsize%3D512/https/cdn.discordapp.com/avatars/271683421065969664/39b66b422ceda77990cbe52d4e794e4f.webp?format=webp' })
        
        await interaction.reply({ embeds: [embed], ephemeral: false })
    },
};
