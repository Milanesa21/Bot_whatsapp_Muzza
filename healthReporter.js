// healthReporter.js
const fs = require("fs");
const path = require("path");

// HEALTH_FILE_PATH se resolverá relativo al directorio donde se ejecuta este script (o app.js si se requiere desde allí)
// Si app.js está en la raíz, y healthReporter.js también, esto es correcto.
// Si app.js está en la raíz, y este archivo está en ./src/utils/, y el archivo de status quieres que esté en la raíz:
// const HEALTH_FILE_PATH = process.env.BOT_HEALTH_FILE || path.join(__dirname, "..", "..", "bot_health.status");
// O más simple, si quieres que esté junto a este archivo:
const HEALTH_FILE_PATH =
  process.env.BOT_HEALTH_FILE || path.join(__dirname, "bot_health.status");

const HEALTHY_INTERVAL = 15 * 60 * 1000;
const ERROR_RETRY_INTERVAL = 30 * 1000;
const RECOVERY_INTERVAL = 5 * 60 * 1000;
const MAX_CONSECUTIVE_ERRORS = 3;
const INITIAL_GRACE_PERIOD = 5000;

let providerInstance = null;
let healthCheckTimeout = null;
let consecutiveErrors = 0;
let currentState = "unknown";
let isFirstCheckCycle = true;

const checkAndReportHealth = async () => {
  if (isFirstCheckCycle) {
    console.log(
      `[HealthReporter] Aplicando periodo de gracia inicial de ${
        INITIAL_GRACE_PERIOD / 1000
      } segundos.`
    );
    await new Promise((resolve) => setTimeout(resolve, INITIAL_GRACE_PERIOD));
    isFirstCheckCycle = false;
  }

  let isCurrentCheckHealthy = false;
  let statusMessage = "unknown";
  const previousState = currentState;

  // Descomentar para debug detallado del ciclo de chequeo
  // console.log(
  //   `[HealthReporter] Realizando chequeo de salud. Estado anterior: ${previousState}`
  // );

  if (providerInstance) {
    try {
      const baileysSocket = providerInstance.getInstance();

      if (!baileysSocket) {
        statusMessage =
          "baileys_socket_not_available (getInstance devolvió null/undefined)";
        isCurrentCheckHealthy = false;
        console.warn(
          `[HealthReporter] providerInstance.getInstance() devolvió: ${baileysSocket}`
        );
      } else {
        if (baileysSocket.user && baileysSocket.user.id) {
          isCurrentCheckHealthy = true;
          statusMessage = `healthy (user session active: ${baileysSocket.user.id})`;

          // Los logs informativos sobre el estado del WebSocket se mantienen comentados a menos que se descomenten para depuración.
          // const wsIsAvailable = baileysSocket.ws;
          // const wsState = wsIsAvailable
          //   ? baileysSocket.ws.readyState
          //   : "ws_object_undefined";
          // if (!wsIsAvailable || wsState !== 1) {
          //   // Log informativo opcional, puede ser verboso si todo está bien pero el WS state es peculiar
          //   console.log(`[HealthReporter] INFO: Sesión de usuario activa. Estado del WebSocket (para info): WS definido: ${!!wsIsAvailable}, Estado WS: ${wsState}.`);
          // }
        } else {
          isCurrentCheckHealthy = false;
          const wsIsAvailable = baileysSocket.ws;
          const wsState = wsIsAvailable
            ? baileysSocket.ws.readyState
            : "ws_object_undefined";
          let userStatus = "ausente o inválido";
          if (baileysSocket.user) {
            userStatus = `presente pero sin ID válido (user.id: ${baileysSocket.user.id})`;
          }
          statusMessage = `unhealthy (user session not active: ${userStatus}. WS state: ${wsState}, WS definido: ${!!wsIsAvailable})`;
          console.error(
            `[HealthReporter] Sesión de usuario no activa. Mensaje: ${statusMessage}`
          ); // Loguear solo si no está saludable por esta razón
        }
      }
    } catch (error) {
      console.error(
        "[HealthReporter] Error durante la verificación del proveedor:",
        error
      );
      statusMessage = `error_during_check: ${error.message}`;
      isCurrentCheckHealthy = false;
    }
  } else {
    statusMessage = "provider_not_initialized";
    isCurrentCheckHealthy = false;
    console.error(
      "[HealthReporter] Proveedor no inicializado al momento del chequeo."
    ); // Loguear si el proveedor no está listo
  }

  const statusData = {
    status: isCurrentCheckHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    message: statusMessage,
  };

  fs.writeFile(HEALTH_FILE_PATH, JSON.stringify(statusData, null, 2), (err) => {
    if (err) {
      console.error(
        "[HealthReporter] Error al escribir el archivo de estado de salud:",
        err
      );
    }
    // Descomentar para loguear cada escritura (puede ser verboso)
    // else { console.log(`[HealthReporter] Archivo de estado actualizado: ${statusData.status}`); }
  });

  let nextCheckInterval;

  if (isCurrentCheckHealthy) {
    if (currentState !== "healthy") {
      // Loguear solo si el estado cambia a healthy o es la primera vez
      console.log(
        `[HealthReporter] Chequeo exitoso. El bot está saludable. Mensaje: ${statusMessage}`
      );
    }
    consecutiveErrors = 0;
    const previousReportingState = currentState; // Guardar el estado antes de actualizarlo
    currentState = "healthy";

    if (previousReportingState === "unhealthy") {
      nextCheckInterval = RECOVERY_INTERVAL;
      console.log(
        `[HealthReporter] Bot recuperado de un error. Programando chequeo de confirmación en ${
          RECOVERY_INTERVAL / 1000
        } segundos.`
      );
    } else {
      // unknown, healthy, o recovering (aunque no usemos recovering explícitamente)
      nextCheckInterval = HEALTHY_INTERVAL;
      // No loguear el estado "healthy" normal si ya estábamos healthy, solo si venimos de "unknown" (la primera vez)
      if (previousReportingState === "unknown") {
        console.log(
          `[HealthReporter] Bot saludable. Programando próximo chequeo normal en ${
            HEALTHY_INTERVAL / 1000
          } segundos.`
        );
      }
    }
  } else {
    consecutiveErrors++;
    // No es necesario loguear aquí "Chequeo fallido" genérico, ya se logueó arriba el motivo específico (sesión inactiva, error, etc.)
    currentState = "unhealthy";

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error(
        `[HealthReporter] Se alcanzó el umbral de ${MAX_CONSECUTIVE_ERRORS} errores consecutivos. ¡Reiniciando proceso!`
      );
      if (healthCheckTimeout) clearTimeout(healthCheckTimeout);
      process.exit(1); // Salir para que Docker/Railway reinicie
      return; // No programar más chequeos
    } else {
      nextCheckInterval = ERROR_RETRY_INTERVAL;
      console.log(
        `[HealthReporter] Errores consecutivos: ${consecutiveErrors}. Programando reintento rápido en ${
          ERROR_RETRY_INTERVAL / 1000
        } segundos.`
      );
    }
  }

  if (healthCheckTimeout) clearTimeout(healthCheckTimeout);
  healthCheckTimeout = setTimeout(checkAndReportHealth, nextCheckInterval);
};

const startHealthReporting = (provider) => {
  if (!provider) {
    console.error(
      "[HealthReporter] No se puede iniciar el reporte de salud: El proveedor es nulo."
    );
    return;
  }
  providerInstance = provider;
  currentState = "unknown";
  consecutiveErrors = 0;
  isFirstCheckCycle = true; // Resetear para la gracia inicial

  console.log(
    `[HealthReporter] Reporte de salud iniciado. Escribirá el estado en ${HEALTH_FILE_PATH}.`
  );
  if (healthCheckTimeout) clearTimeout(healthCheckTimeout); // Limpiar por si se llama múltiples veces

  healthCheckTimeout = setTimeout(checkAndReportHealth, 0); // Iniciar el ciclo inmediatamente
};

const stopHealthReporting = () => {
  if (healthCheckTimeout) {
    clearTimeout(healthCheckTimeout);
    healthCheckTimeout = null;
    console.log("[HealthReporter] Reporte de salud detenido.");
  }
};

module.exports = {
  startHealthReporting,
  stopHealthReporting,
  HEALTH_FILE_PATH,
};
