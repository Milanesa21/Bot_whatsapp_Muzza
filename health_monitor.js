// health_monitor.js
const fs = require("fs");
const path = require("path");

// Asegúrate de que esta ruta coincida con la usada en healthReporter.js
// Si app.js (y healthReporter.js) están en la raíz, y este monitor también:
const HEALTH_FILE_PATH =
  process.env.BOT_HEALTH_FILE || path.join(__dirname, "bot_health.status");
// Si healthReporter.js está en './src/' y escribe 'bot_health.status' allí, y este monitor está en la raíz:
// const HEALTH_FILE_PATH = process.env.BOT_HEALTH_FILE || path.join(__dirname, "src", "bot_health.status");

const MAX_AGE_SECONDS = 70 * 60; // El archivo debe ser más reciente que 70 minutos (INTERVALO_REPORTE + margen)

const checkHealthFile = () => {
  try {
    if (!fs.existsSync(HEALTH_FILE_FILE)) {
      console.error(
        `[HealthMonitor] Health file not found: ${HEALTH_FILE_PATH}`
      );
      return false; // Fallo
    }

    const fileContent = fs.readFileSync(HEALTH_FILE_PATH, "utf8");
    const statusData = JSON.parse(fileContent);

    if (statusData.status !== "healthy") {
      console.error(
        `[HealthMonitor] Bot reported unhealthy status: ${statusData.status} - ${statusData.message}`
      );
      return false; // Fallo
    }

    const timestamp = new Date(statusData.timestamp);
    const now = new Date();
    const ageSeconds = (now.getTime() - timestamp.getTime()) / 1000;

    if (ageSeconds > MAX_AGE_SECONDS) {
      console.error(
        `[HealthMonitor] Health file is too old. Last update: ${
          statusData.timestamp
        } (${ageSeconds.toFixed(
          0
        )} seconds ago). Max age: ${MAX_AGE_SECONDS} seconds.`
      );
      return false; // Fallo
    }

    // console.log(`Bot is healthy. Status last updated: ${statusData.timestamp}`); // Eliminado
    return true; // Éxito
  } catch (error) {
    console.error("[HealthMonitor] Error checking health file:", error);
    return false; // Fallo por error de lectura/parseo
  }
};

// Ejecutar el chequeo y salir con código 0 (éxito) o 1 (fallo)
if (checkHealthFile()) {
  process.exit(0); // Éxito
} else {
  process.exit(1); // Fallo
}
