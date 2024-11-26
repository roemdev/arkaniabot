const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits, REST, Routes, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFilesAndFolders = fs.readdirSync(commandsPath);

const commands = [];
// Carga de comandos y preparación de comandos para deploy
for (const item of commandFilesAndFolders) {
  const itemPath = path.join(commandsPath, item);
  if (fs.statSync(itemPath).isDirectory()) {
    const commandFiles = fs
      .readdirSync(itemPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(itemPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  } else if (item.endsWith(".js")) {
    const command = require(itemPath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Carga de eventos
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Añadir la escucha para los mensajes con prefijo
const authorizedUserId = '271683421065969664';  // Tu ID de usuario de Discord

client.on('messageCreate', async (message) => {
  // Evitar que el bot se responda a sí mismo
  if (message.author.bot) return;

  // Verificar si el mensaje comienza con el prefijo y el comando 'reset'
  if (message.content.startsWith('arkaniabot- reset')) {
    // Verificar si el autor del mensaje es el usuario autorizado
    if (message.author.id !== authorizedUserId) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor('#F87171') // Rojo (mensaje de error)
        .setDescription('<:decline:1286772064765743197> No tienes permisos para reiniciar el bot.');

      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    // Crear el embed de reinicio
    const restartEmbed = new EmbedBuilder()
      .setColor('#79E096') // Verde (mensaje positivo)
      .setDescription('<:check:1286772042657566780> El bot se está reiniciando.')

    // Enviar el embed de reinicio en el canal
    await message.channel.send({ embeds: [restartEmbed] });

    // Reiniciar el bot
    process.exit();  // Detener el proceso de Node.js, reiniciando el bot
  }
});

// Función para registrar los comandos y luego iniciar el bot
(async () => {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Registrar comandos en el servidor
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);

    client.login(token);
  } catch (error) {
    console.error(error);
  }
})();