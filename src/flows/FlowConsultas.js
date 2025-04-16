const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowPrincipal = require("./FlowPrincipal");

const flowConsultas = addKeyword(EVENTS.ACTION)
  // Mensaje inicial de aviso
  .addAnswer(
    "En un momento serás atendido por alguno de nuestros empleados. Para volver al menú de inicio, por favor escribe 'Muzza'."
  )
  // Se queda esperando mensajes; el bot no responde nada a menos que el mensaje sea exactamente "Muzza"
  .addAction({ capture: true }, async (ctx, { gotoFlow, fallBack }) => {
    const mensaje = ctx.body.trim().toLowerCase();
    if (mensaje === "muzza") {
      // Se redirige al flujo principal cuando el mensaje sea "muzza"
      return gotoFlow(flowPrincipal);
    } else {
      // Si el mensaje no es "muzza", el bot no responde nada y se queda a la espera.
      return fallBack();
    }
  });

module.exports = flowConsultas;
