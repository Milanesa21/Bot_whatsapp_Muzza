const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");


const menuBebidas = {
  1: { nombre: "PEPSI 1.5L", precio: 4300 },
  2: { nombre: "PEPSI 354ML", precio: 2100 },
  3: { nombre: "PEPSI 500CC", precio: 3450 },
  4: { nombre: "7UP 1.5L", precio: 4350 },
  5: { nombre: "7UP 354ML", precio: 1500 },
  6: { nombre: "7UP 500CC", precio: 3000 },
  7: { nombre: "MIRINDA 1.5L", precio: 3800 },
  8: { nombre: "MIRINDA 354ML", precio: 2100 },
  9: { nombre: "MIRINDA 500CC", precio: 3450 },
  10: { nombre: "FANTA 1L", precio: 6900 },
  11: { nombre: "FANTA 375ML", precio: 1950 },
  12: { nombre: "FANTA 500CC", precio: 4600 },
  13: { nombre: "SPRITE 375ML", precio: 1950 },
  14: { nombre: "SPRITE 500CC", precio: 4600 },
  15: { nombre: "AGUA SIN GAS 600ml", precio: 2300 },
  16: { nombre: "AGUA CON GAS 600ml", precio: 2300 },
  17: { nombre: "PATAGONIA AMBER LAGER 710CC", precio: 6700 },
  18: { nombre: "CORONA 710CC", precio: 6750 },
  19: { nombre: "CORONA LATA 410CC", precio: 4350 },
  20: { nombre: "STELLA 1L", precio: 7700 },
  21: { nombre: "STELLA 710CC", precio: 6750 },
  22: { nombre: "BRAHMA 1L", precio: 4700 },
  23: { nombre: "HEINEKEN 1L", precio: 7700 },
};

const generarMenuTexto = () => {
  let menuTexto = "🥤 *MENÚ DE BEBIDAS* 🥤\n\n";
  menuTexto += "Elige una opción:\n\n";
  for (const [key, value] of Object.entries(menuBebidas)) {
    menuTexto += `${key}. ${value.nombre} - $${value.precio}\n`;
  }
  menuTexto += "\n0. Cancelar y volver al menú principal";
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowGaseosas = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
    const seleccion = ctx.body.trim();

    if (seleccion === "0") {
      await flowDynamic("🚫 Operación cancelada. Volviendo al menú principal.");
      return gotoFlow(require("./FlowSeleccionMenu"));
    }

    const opcionesValidas = Object.keys(menuBebidas).map(Number);
    if (!validarSeleccion(seleccion, opcionesValidas)) {
      return fallBack("❌ Por favor, selecciona una opción válida (0-23)");
    }

    const opcion = parseInt(seleccion);
    const bebida = menuBebidas[opcion];
    const currentPedido = await getPedidoActual(state);

    await state.update({
      pedidoActual: {
        ...currentPedido,
        ultimoProducto: bebida, // Enviamos el objeto completo al flowCantidad
      },
    });

    await flowDynamic(
      `🥤 Has seleccionado *${bebida.nombre}* ($${bebida.precio}).`
    );
    return gotoFlow(require("./FlowCantidad")); 
  }
);

module.exports = flowGaseosas;