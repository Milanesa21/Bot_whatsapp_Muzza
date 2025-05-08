const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");

const flowSeleccionarMenu = addKeyword(EVENTS.ACTION).addAnswer(
  "🍽️ *Elige el menú del que deseas agregar más productos:* 🍽️\n\n" +
    "1️⃣ 🍕 Pizzas\n" +
    "2️⃣ 🥪 Hamburguesas/Alitos\n" +
    "3️⃣ 🥟 Empanadas\n" +
    "4️⃣ 🥤 Bebidas\n" +
    "5️⃣ 🥐 Panadería\n" +
    "6️⃣ 🍝 Pastas\n\n" +
    "Responde con el número o el nombre del menú que deseas. 😊",
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic, state }) => {
    const seleccion = ctx.body.toLowerCase();
    const currentPedido = await getPedidoActual(state);

    if (seleccion == "1" || seleccion.includes("pizz")) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Pizzería" },
      });
      await flowDynamic("🍕 *Has seleccionado el menú de Pizzería* 🍕");
      return gotoFlow(require("./FlowPizzeria"));
    }

    if (
      seleccion == "2" ||
      seleccion.includes("Hamburguesas") ||
      seleccion.includes("Hamburguesas")
    ) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Hamburguesas/Alitos" },
      });
      await flowDynamic(
        "🥪 *Has seleccionado el menú de Hamburguesas/Alitos* 🥪"
      );
      return gotoFlow(require("./FlowSandwiches"));
    }

    if (seleccion == "3" || seleccion.includes("empanadas")) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Empanadas" },
      });
      await flowDynamic("🥟 *Has seleccionado el menú de Empanadas* 🥟");
      return gotoFlow(require("./flowMenuEmpanadas"));
    }

    if (
      seleccion == "4" ||
      seleccion.includes("bebida") ||
      seleccion.includes("gaseosa") ||
      seleccion.includes("agua")
    ) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Bebidas" },
      });
      await flowDynamic("🥤 *Has seleccionado el menú de Bebidas* 🥤");
      return gotoFlow(require("./flowGaseosa"));
    }

    if (
      seleccion == "5" ||
      seleccion.includes("panaderia") ||
      seleccion.includes("pan")
    ) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Panadería" },
      });
      await flowDynamic("🥐 *Has seleccionado el menú de Panadería* 🥖");
      return gotoFlow(require("./FlowPanaderia"));
    }

    if (seleccion == "6" || seleccion.includes("pasta")) {
      await state.update({
        pedidoActual: { ...currentPedido, tipo: "Pastas" },
      });
      await flowDynamic("🍝 *Has seleccionado el menú de Pastas* 🧀");
      return gotoFlow(require("./flowPastas"));
    }

    return fallBack(
      "❌ *Opción no válida.* Por favor, selecciona una de las siguientes opciones:\n\n" +
        "1️⃣ 🍕 Pizzas\n" +
        "2️⃣ 🥪 Sándwiches\n" +
        "3️⃣ 🥟 Empanadas\n" +
        "4️⃣ 🥤 Bebidas\n" +
        "5️⃣ 🥐 Panadería\n" +
        "6️⃣ 🍝 Pastas\n\n" +
        "Responde con el número o el nombre del menú que deseas. 😊"
    );
  }
);

module.exports = flowSeleccionarMenu;
