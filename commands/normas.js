const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("normas")
    .setDescription("Envía las normas de Arkania."),
  
  async execute(interaction) {
    const embedTitle = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle("NORMAS")
      .setImage('https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=672b6e41&is=672a1cc1&hm=27d52116de757eacda18b0d5cecfcf1f9eab6bf11c5119bc305349820367e871&');

    const embedDesc = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setDescription(" ")
      .addFields(
        { name: "***`NSFW`***", value: "El contenido NSFW (para adultos) está estrictamente prohibido en todos los canales." },
        { name: "***`PUBLICIDAD`***", value: "Queda prohibida cualquier forma de publicidad de otros servidores." },
        { name: "***`SPAM`***", value: "No se permite enviar mensajes rápidamente con la intención de interrumpir el chat." },
        { name: "***`ACOSO`***", value: "Se prohíbe cualquier forma de acoso, incluido el chantaje, compartir o filtrar información personal." },
        { name: "***`PIRATERÍA`***", value: "No se permite compartir software pirata, cracks, keygens, o cualquier otro contenido ilegal." },
        { name: "***`DISCORD`***", value: "Cumplir con [TOS](https://discord.com/terms) y [Guidelines](https://discord.com/guidelines) de Discord." }
      )
      .setImage('https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=672b6e41&is=672a1cc1&hm=27d52116de757eacda18b0d5cecfcf1f9eab6bf11c5119bc305349820367e871&');

    const embedLvlTitle = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setTitle("ROLES POR NIVEL")
      .setImage('https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=672b6e41&is=672a1cc1&hm=27d52116de757eacda18b0d5cecfcf1f9eab6bf11c5119bc305349820367e871&');

    const embedLvlDesc = new EmbedBuilder()
      .setColor("NotQuiteBlack")
      .setDescription("`⬆️` <@&1284145913354522685>\n`⬆️` <@&1234893710588645426>\n`⬆️` <@&1284145958149554309>\n`⬆️` <@&1251306364878458931>\n`⬆️` <@&1247699315908935680>")
      .setImage('https://cdn.discordapp.com/attachments/860528686403158046/1108384769147932682/ezgif-2-f41b6758ff.gif?ex=672b6e41&is=672a1cc1&hm=27d52116de757eacda18b0d5cecfcf1f9eab6bf11c5119bc305349820367e871&');

    // Enviar el mensaje al canal en lugar de responder a la interacción
    await interaction.channel.send({ embeds: [embedTitle, embedDesc, embedLvlTitle, embedLvlDesc] });

    // Confirmar la ejecución de la interacción para evitar errores
    await interaction.reply({ content: "Normas enviadas.", ephemeral: true });
  },
};
