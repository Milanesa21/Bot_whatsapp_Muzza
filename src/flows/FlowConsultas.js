const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { chat } = require("../../chatgpt")
const flowPrincipal = require("./FlowPrincipal")



const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer("📝 *Consultas* 📝")
  .addAnswer(
    "¿En qué podemos ayudarte?",
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const consulta = ctx.body;

      // Usar la función chat para obtener una respuesta a la consulta
      const respuestaIA = await chat(
        "Responde a la consulta del cliente de manera clara y amigable:",
        consulta
      );

      // Verificar si la respuesta de la IA es válida
      if (respuestaIA === "ERROR") {
        await flowDynamic(
          "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo más tarde."
        );
        return fallBack();
      }

      // Mostrar la respuesta de la IA
      await flowDynamic(respuestaIA);

      // Preguntar si desea realizar un pedido o hacer otra consulta
      await flowDynamic(
        [
          "¿Deseas realizar un pedido ahora?",
          "",
          "1️⃣ Sí, quiero hacer un pedido",
          "2️⃣ No, quiero hacer otra consulta",
        ].join("\n")
      );

      return fallBack();
    }
  )
  .addAction(
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("si")) {
        await flowDynamic("Perfecto, vamos a iniciar un nuevo pedido. 🍕🥐🥪");
        return gotoFlow(flowPrincipal);
      } else if (respuesta.includes("2") || respuesta.includes("no")) {
        await flowDynamic("Claro, ¿en qué más podemos ayudarte? 📝");
        return fallBack();
      } else {
        await flowDynamic(
          [
            "Por favor, selecciona una opción válida:",
            "",
            "1️⃣ Sí, quiero hacer un pedido",
            "2️⃣ No, quiero hacer otra consulta",
          ].join("\n")
        );
        return fallBack();
      }
    }
  );

module.exports =  flowConsultas ;
