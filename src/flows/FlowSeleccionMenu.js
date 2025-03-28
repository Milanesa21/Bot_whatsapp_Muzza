const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");

const flowSeleccionarMenu = addKeyword(EVENTS.ACTION).addAnswer(
  "🍽️ *Elige el menú del que deseas agregar más productos:* 🍽️\n\n" +
    "1️⃣ 🍕 Pizzas\n" +
    "2️⃣ 🥪 Sándwiches\n" +
    "3️⃣ 🥟 Empanadas\n" +
    "4️⃣ 🥤 Gaseosas, Aguas y Bebidas\n\n" +
    "Responde con el número o el nombre del menú que deseas. 😊",
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    const seleccion = ctx.body.toLowerCase();

    if (seleccion == "1" || seleccion.includes("pizz")) {
      pedidoActual.tipo = "Pizzería"; // Asignar el tipo de menú
      await flowDynamic("🍕 *Has seleccionado el menú de Pizzería* 🍕");
      const flowMenuPizzeria = require("./FlowPizzeria"); // Importar aquí para evitar dependencia circular
      return gotoFlow(flowMenuPizzeria);
    } else if (seleccion == "2" || seleccion.includes("sandwich")) {
      pedidoActual.tipo = "Sándwiches"; // Asignar el tipo de menú
      await flowDynamic("🥪 *Has seleccionado el menú de Sándwiches* 🥪");
      const flowMenuSandwiches = require("./FlowSandwiches"); // Importar aquí para evitar dependencia circular
      return gotoFlow(flowMenuSandwiches);
    } else if (seleccion == "3" || seleccion.includes("empanadas")) {
      pedidoActual.tipo = "Empanadas"; // Asignar el tipo de menú
      await flowDynamic("🥟 *Has seleccionado el menú de Empanadas* 🥟");
      const flowMenuEmpanadas = require("./flowMenuEmpanadas"); // Importar aquí para evitar dependencia circular
      return gotoFlow(flowMenuEmpanadas);
    } else if (
      seleccion == "4" ||
      seleccion.includes("gas") ||
      seleccion.includes("gaseosa") ||
      seleccion.includes("agua")
    ) {
      pedidoActual.tipo = "Gaseosas"; // Asignar el tipo de menú
      await flowDynamic(
        "🥤 *Has seleccionado el menú de Gaseosas y Aguas Saborizadas* 🥤"
      );
      const flowGaseosas = require("./flowGaseosa"); // Importar aquí para evitar dependencia circular
      return gotoFlow(flowGaseosas);
    } else {
      return fallBack(
        "❌ *Opción no válida.* Por favor, selecciona una de las siguientes opciones:\n\n" +
          "1️⃣ 🍕 Pizzas\n" +
          "2️⃣ 🥪 Sándwiches\n" +
          "3️⃣ 🥟 Empanadas\n" +
          "4️⃣ 🥤 Gaseosas, Aguas y Bebidas\n\n" +
          "Responde con el número o el nombre del menú que deseas. 😊"
      );
    }
  }
);

module.exports = flowSeleccionarMenu;
