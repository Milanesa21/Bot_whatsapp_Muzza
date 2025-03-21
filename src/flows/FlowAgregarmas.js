const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowDelivery = require("./FlowDelivery")

const flowAgregarMas = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Deseas agregar algo más a tu pedido?")
  .addAnswer(
    ["1️⃣ Sí, agregar más productos", "2️⃣ No, continuar con el pedido"].join(
      "\n"
    ),
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("si")) {
        // Si elige "Sí", mostrar opciones de menú
        await flowDynamic(
          "¿De qué menú deseas agregar más productos?\n\n" +
            "1. 🍕 Pizzas\n" +
            "2. 🥪 Sándwiches\n" +
            "3. 🥖 Panadería"
        );
        return gotoFlow(require("./FlowSeleccionMenu").flowSeleccionarMenu);
      } else if (respuesta.includes("2") || respuesta.includes("no")) {
        // Si elige "No", continuar con el pedido
        return gotoFlow(flowDelivery);
      } else {
        // Respuesta no válida
        return fallBack(
          "Por favor, indica si deseas agregar más productos (1) o continuar con el pedido (2)"
        );
      }
    }
  );

module.exports =  flowAgregarMas ;
