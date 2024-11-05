const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
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

    // Iniciar sesión en Discord después de registrar los comandos
    client.login(token);
  } catch (error) {
    console.error(error);
  }
})();
