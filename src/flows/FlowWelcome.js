// flows/flowWelcome.js
const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
// Importar flowPrincipal al inicio del archivo
const flowPrincipal = require("./FlowPrincipal");

const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  "👋 ¡Hola! Bienvenido a *Muzza*",
  null, // No necesitamos capturar la respuesta del usuario aquí
  async (_, { gotoFlow, flowDynamic }) => {
    try {
      if (!flowPrincipal) {
        console.error(
          "Error crítico: flowPrincipal no se cargó correctamente al inicio."
        );
        await flowDynamic(
          "⚠️ Error interno del bot. No se pudo cargar el menú principal."
        );
        return;
      }
      // Redirigimos al flujo principal
      return gotoFlow(flowPrincipal);
    } catch (error) {
      console.error(
        "Error al intentar ir a flowPrincipal desde flowWelcome:",
        error
      );
      await flowDynamic(
        "⚠️ Hubo un problema al iniciar el menú. Por favor, intenta escribir 'hola' o 'menu'."
      );
    }
  }
);

module.exports = flowWelcome;
