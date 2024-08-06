const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [
        { name: `🔗 discord.gg/jA8tx5Vwe5`, type: ActivityType.Custom },
      ],
      status: "online"
    });
  },
};
