const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra la latencia del bot y de la API de Discord'),
    async execute(interaction) {
        
        // Defiere la respuesta para calcular la latencia sin un mensaje visible
        await interaction.deferReply();

        const botLatency = Date.now() - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;
        const botUptime = Math.floor(process.uptime());

        // Convertir el uptime en segundos a un formato legible
        const days = Math.floor(botUptime / (24 * 60 * 60));
        const hours = Math.floor((botUptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((botUptime % (60 * 60)) / 60);
        const seconds = botUptime % 60;
        const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const currentDateTime = new Date().toLocaleString();

        // Crear el embed con la información de latencia
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`🏓 pong!`)
            .setDescription(`**bot:** \`${botLatency}ms\` | **api:** \`${apiLatency}ms\`\n**uptime:** \`${uptimeFormatted}\``)
            .setFooter({ text: `${currentDateTime}` });

        await interaction.followUp({ embeds: [embed] });
    },
};
