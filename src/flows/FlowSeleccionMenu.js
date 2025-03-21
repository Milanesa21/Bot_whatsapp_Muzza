const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowMenuPizzeria = require("./FlowPizzeria");
const flowMenuSandwiches = require("./FlowSandwiches");
const flowMenuPanaderia = require("./FlowPanaderia");

const flowSeleccionarMenu = addKeyword(EVENTS.ACTION).addAnswer(
  "Elige el menú del que deseas agregar más productos:\n\n" +
    "1. 🍕 Pizzas\n" +
    "2. 🥪 Sándwiches\n" +
    "3. 🥖 Panadería",
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    const seleccion = ctx.body;

    if (seleccion === "1") {
      pedidoActual.tipo = "Pizzería"; // Asignar el tipo de menú
      return gotoFlow(flowMenuPizzeria);
    } else if (seleccion === "2") {
      pedidoActual.tipo = "Sándwiches"; // Asignar el tipo de menú
      return gotoFlow(flowMenuSandwiches);
    } else if (seleccion === "3") {
      pedidoActual.tipo = "Panadería"; // Asignar el tipo de menú
      return gotoFlow(flowMenuPanaderia);
    } else {
      return fallBack("Por favor, selecciona una opción válida (1-3)");
    }
  }
);

module.exports = flowSeleccionarMenu;
