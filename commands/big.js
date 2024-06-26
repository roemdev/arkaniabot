const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('big')
        .setDescription('Envía el emoji agrandado.')
        .addStringOption(option => 
            option.setName('emoji')
                .setDescription('El emoji del servidor')
                .setRequired(true)),
    async execute(interaction) {
        const emoji = interaction.options.getString('emoji');

        // Regular expression to match custom emoji format
        const emojiRegex = /<a?:[a-zA-Z0-9_]+:(\d+)>/;
        const match = emoji.match(emojiRegex);

        if (!match) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Rojo para indicar error
                .setDescription('¡Debes proporcionar un emoji del servidor!');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const emojiId = match[1];
        const isAnimated = emoji.startsWith('<a:'); // Check if the emoji is animated

        // Construct URL to the emoji image
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
        
        // Embed
        const embed = new EmbedBuilder()
            .setColor('#e6ab99')
            .setImage(emojiUrl);

        await interaction.reply({ embeds: [embed], allowedMentions: { repliedUser: false } })
            .catch(err => console.error('Error al enviar el comando big:', err));
    },
};
