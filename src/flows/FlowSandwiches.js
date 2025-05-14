const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowCantidad = require("./FlowCantidad");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const menuSandwiches = {
  1: { nombre: "Hamburguesa Especial", precio: 9000 },
  2: { nombre: "Hamburguesa Completa", precio: 9500 },
  3: { nombre: "Sándwich de Pollo Especial", precio: 9000 },
  4: { nombre: "Sándwich de Pollo Completo", precio: 9500 },
  5: { nombre: "Alito de Pollo Especial", precio: 14000 },
  6: { nombre: "Alito de Pollo Completo", precio: 15000 },
};

const generarMenuTexto = () => {
  let menuTexto = "🥪 *MENÚ DE SÁNDWICHES* 🥪\n\n";
  menuTexto += "Elige un sándwich, hamburguesa, alito o similar:\n\n";
  for (const [key, value] of Object.entries(menuSandwiches)) {
    menuTexto += `${key}. ${value.nombre} - $${value.precio}\n`;
  }
  menuTexto += "\n0. Cancelar y volver al menú principal";
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuSandwiches = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
    const seleccion = ctx.body.trim();

    if (seleccion === "0") {
      await flowDynamic("🚫 Operación cancelada. Volviendo al menú principal.");
      return gotoFlow(require("./FlowSeleccionMenu"));
    }

    const opcionesValidas = Object.keys(menuSandwiches).map(Number);
    if (!validarSeleccion(seleccion, opcionesValidas)) {
      return fallBack("❌ Por favor, selecciona una opción válida (0-6)");
    }

    const opcion = parseInt(seleccion);
    const item = menuSandwiches[opcion];
    const currentPedido = await getPedidoActual(state);

    await state.update({
      pedidoActual: {
        ...currentPedido,
        ultimoProducto: item, // Guardamos el objeto completo
      },
    });

    await flowDynamic(`🥪 Has seleccionado *${item.nombre}*`);
    return gotoFlow(require("./FlowCantidad")); // Redirigimos al flow de cantidad
  }
);

module.exports = flowMenuSandwiches;
