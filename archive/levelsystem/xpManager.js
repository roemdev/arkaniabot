const {
  calcularNivel,
  experienciaParaSiguienteNivel,
  obtenerRolParaNivel,
  obtenerCanalNivelUp,
} = require("./levelUtils");
const db = require("../../database/database");

// Función para manejar la experiencia y la asignación de roles
function manejarExperienciaYRoles(interaction, userId, expGanada) {
  db.get(`SELECT * FROM users WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    const experienciaActual = row ? row.experience : 0;
    const nivelActual = row ? row.level : 0;
    const experienciaNueva = experienciaActual + expGanada;
    const nivelNuevo = calcularNivel(experienciaNueva);

    if (!row) {
      db.run(
        `INSERT INTO users (user_id, experience, level) VALUES (?, ?, ?)`,
        [userId, expGanada, nivelNuevo]
      );
    } else {
      if (nivelNuevo > nivelActual) {
        db.run(`UPDATE users SET experience = ?, level = ? WHERE user_id = ?`, [
          experienciaNueva,
          nivelNuevo,
          userId,
        ]);

        const rolAsignado = obtenerRolParaNivel(nivelNuevo); // Obtiene el rol para el nivel
        const levelUpChannel = obtenerCanalNivelUp(); // Obtiene el canal de nivel

        if (levelUpChannel) {
          const mensaje = `¡Felicidades <@${userId}>! Has subido al nivel **${nivelNuevo}**.${
            rolAsignado
              ? ` Se te ha asignado el rol <@&${rolAsignado.id}>.`
              : ""
          }`;

          levelUpChannel.send(mensaje);
        }
      } else {
        db.run(`UPDATE users SET experience = ? WHERE user_id = ?`, [
          experienciaNueva,
          userId,
        ]);
      }
    }
  });
}

module.exports = { manejarExperienciaYRoles };
