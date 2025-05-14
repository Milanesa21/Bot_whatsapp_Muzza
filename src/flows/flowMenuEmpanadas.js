const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowCantidad = require("./FlowCantidad");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const menuEmpanadas = {
  1: { nombre: "Empanada de Jamón y Queso", precio: 1700 },
  2: { nombre: "Empanada de Roquefort", precio: 1700 },
  3: { nombre: "Empanada de Champiñón", precio: 1700 },
  4: { nombre: "Empanada de Pollo", precio: 1700 },
  5: { nombre: "Empanada de Napolitana", precio: 1700 },
  6: { nombre: "Empanada de Palmitos", precio: 1700 },
  7: { nombre: "Empanada de Huevos", precio: 1700 },
  8: { nombre: "Empanada de Muzzarella", precio: 1700 },
  9: { nombre: "Empanada de Choclo", precio: 1700 },
  10: { nombre: "Empanada de Cebolla", precio: 1700 },
  11: { nombre: "Empanada de Verduras", precio: 1700 },
  12: { nombre: "Empanada de Fontina", precio: 1700 },
  13: { nombre: "Empanada de Capresse", precio: 1700 },
  14: { nombre: "Empanada Árabes", precio: 1700 },
  15: { nombre: "Empanada de Charque", precio: 1700 },
  16: { nombre: "Empanada de Calabresa", precio: 1700 },
  17: { nombre: "Empanada de Carne", precio: 1700 },
  18: { nombre: "Empanada de Osobuco", precio: 1700 },
  19: { nombre: "Empanada de Maturre", precio: 1700 },
  20: { nombre: "Empanada de Vacío y Provoleta", precio: 1700 },
  21: { nombre: "Empanada de Carne Dulce", precio: 1700 },
  22: { nombre: "Empanada de Carne Picante", precio: 1700 },
  23: { nombre: "Empanada de Carne y Pasas", precio: 1700 },
  24: { nombre: "Empanada de Carne y Aceitunas", precio: 1700 },
};

const generarMenuTexto = () => {
  let texto = "🥟 *MENÚ DE EMPANADAS* 🥟\n\n";
  texto += "Elige una opción por número ($1700 c/u):\n\n";
  for (const [key, { nombre }] of Object.entries(menuEmpanadas)) {
    texto += `${key}. ${nombre}\n`;
  }
  texto += "\n0. Cancelar y volver al menú principal";
  return texto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuEmpanadas = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
    const seleccion = ctx.body.trim();

    if (seleccion === "0") {
      await flowDynamic("🚫 Operación cancelada. Volviendo al menú principal.");
      return gotoFlow(require("./FlowSeleccionMenu"));
    }

    const opcionesValidas = Object.keys(menuEmpanadas).map(Number);
    if (!validarSeleccion(seleccion, opcionesValidas)) {
      return fallBack("❌ Por favor, selecciona una opción válida (0-24)");
    }

    const opcion = parseInt(seleccion);
    const empanada = menuEmpanadas[opcion];
    const currentPedido = await getPedidoActual(state);

    await state.update({
      pedidoActual: {
        ...currentPedido,
        ultimoProducto: empanada, // Guardamos el objeto completo con precio
      },
    });

    await flowDynamic(`🥟 Has seleccionado *${empanada.nombre}*`);
    return gotoFlow(require("./FlowCantidad")); // Redirigimos al flow de cantidad unificado
  }
);

module.exports = flowMenuEmpanadas;
