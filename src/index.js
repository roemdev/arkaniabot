const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits, REST, Routes, EmbedBuilder } = require("discord.js");
require("dotenv").config();

// Configuración del cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

// Función para cargar comandos
function loadCommands(commandsPath) {
  const commands = [];
  const items = fs.readdirSync(commandsPath);

  for (const item of items) {
    const itemPath = path.join(commandsPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      commands.push(...loadCommands(itemPath));
    } else if (item.endsWith(".js")) {
      const command = require(itemPath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[WARNING] El comando en ${itemPath} no tiene propiedades "data" o "execute".`);
      }
    }
  }

  return commands;
}

// Función para cargar eventos
function loadEvents(eventsPath) {
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
  for (const file of files) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.name && typeof event.execute === "function") {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    } else {
      console.warn(`[WARNING] El evento en ${filePath} no tiene propiedades "name" o "execute".`);
    }
  }
}

// Función para reiniciar el bot
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("arkaniabot- reset")) {
    if (message.author.id !== process.env.AUTHORIZED_USER_ID) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#F87171")
        .setDescription("<:deny:1313237501359558809> No tienes permisos para reiniciar el bot.");
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    const restartEmbed = new EmbedBuilder()
      .setColor("#79E096")
      .setDescription("<:check:1313237490395648021> El bot se está reiniciando...");
    await message.channel.send({ embeds: [restartEmbed] });
    process.exit(0);
  }
});

// Registrar comandos y conectar el bot
(async () => {
  const commandsPath = path.join(__dirname, "commands");
  const eventsPath = path.join(__dirname, "events");
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  try {
    const commands = loadCommands(commandsPath);
    loadEvents(eventsPath);

    const rest = new REST({ version: "10" }).setToken(token);
    console.log(`📦 Registrando ${commands.length} comandos en el servidor...`);
    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(`✅ ${data.length} comandos registrados exitosamente.`);
    client.login(token);
  } catch (error) {
    console.error("❌ Error al iniciar el bot:", error);
  }
})();
