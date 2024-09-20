module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    // Asegúrate de que sea una reacción en el canal correcto y en el mensaje correcto
    const roles = {
      "1️⃣": "1286300137936912405",
      "2️⃣": "1286300143213215848",
      "3️⃣": "1286300145310236745",
    };

    const member = await reaction.message.guild.members.fetch(user.id);
    const roleId = roles[reaction.emoji.name];

    if (roleId) {
      await member.roles.add(roleId);
    }
  },
};

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (user.bot) return;

    // Asegúrate de que sea una reacción en el canal correcto y en el mensaje correcto
    const roles = {
      "1️⃣": "1286300137936912405",
      "2️⃣": "1286300143213215848",
      "3️⃣": "1286300145310236745",
    };

    const member = await reaction.message.guild.members.fetch(user.id);
    const roleId = roles[reaction.emoji.name];

    if (roleId) {
      await member.roles.remove(roleId);
    }
  },
};
