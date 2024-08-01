require("dotenv").config(); // Cargar variables de entorno

const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFilesAndFolders = fs.readdirSync(commandsPath);

for (const item of commandFilesAndFolders) {
  const itemPath = path.join(commandsPath, item);
  const stats = fs.statSync(itemPath);

  if (stats.isDirectory()) {
    const commandFiles = fs
      .readdirSync(itemPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(itemPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  } else if (stats.isFile() && item.endsWith(".js")) {
    const command = require(itemPath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`
      );
    }
  } else {
    console.log(
      `[WARNING] The item at ${itemPath} is neither a file nor a directory.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
