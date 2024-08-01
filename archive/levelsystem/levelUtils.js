const fs = require("fs");
const path = require("path");

// Cargar configuración
const configPath = path.join(__dirname, "./levelConfig.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Funciones de cálculo de experiencia y nivel
function experienciaParaNivel(nivel) {
  const factor = 100;
  return nivel * nivel * factor;
}

function calcularNivel(experiencia) {
  const factor = 100;
  return Math.floor(Math.sqrt(experiencia / factor));
}

function experienciaParaSiguienteNivel(experiencia) {
  const nivelActual = calcularNivel(experiencia);
  const siguienteNivel = nivelActual + 1;
  return experienciaParaNivel(siguienteNivel);
}

// Función para crear una barra de progreso
function crearBarraProgreso(expActual, expNecesaria) {
  const total = 20; // Tamaño de la barra
  const porcentaje = (expActual / expNecesaria) * 100;
  const progreso = Math.round((porcentaje / 100) * total);
  const barra = "█".repeat(progreso) + "░".repeat(total - progreso);
  return { barra, porcentaje };
}

// Función para obtener el rol basado en el nivel
function obtenerRolParaNivel(guild, nivel) {
  const rolId = config.rolesPorNivel[nivel];
  return rolId ? guild.roles.cache.get(rolId) : null;
}

// Función para obtener el canal de nivel up
function obtenerCanalNivelUp(guild) {
  return guild.channels.cache.get(config.canalNivelUp);
}

module.exports = {
  experienciaParaNivel,
  calcularNivel,
  experienciaParaSiguienteNivel,
  crearBarraProgreso,
  obtenerRolParaNivel,
  obtenerCanalNivelUp,
};
