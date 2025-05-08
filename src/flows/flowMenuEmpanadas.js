const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

const menuEmpanadas = {
  1: "Empanada de Jamón y Queso",
  2: "Empanada de Roquefort",
  3: "Empanada de Champiñón",
  4: "Empanada de Pollo",
  5: "Empanada de Napolitana",
  6: "Empanada de Palmitos",
  7: "Empanada de Huevos",
  8: "Empanada de Muzzarella",
  9: "Empanada de Choclo",
  10: "Empanada de Cebolla",
  11: "Empanada de Verduras",
  12: "Empanada de Fontina",
  13: "Empanada de Capresse",
  14: "Empanada Árabes",
  15: "Empanada de Charque",
  16: "Empanada de Calabresa",
  17: "Empanada de Carne",
  18: "Empanada de Osobuco",
  19: "Empanada de Maturre",
  20: "Empanada de Vacío y Provoleta",
  21: "Empanada de Carne Dulce",
  22: "Empanada de Carne Picante",
  23: "Empanada de Carne y Pasas",
  24: "Empanada de Carne y Aceitunas",
};

const generarMenuTexto = () => {
  let texto = "🥟 *MENÚ DE EMPANADAS* 🥟\n\n";
  texto += "Elige una opción por número:\n\n";
  for (const [key, nombre] of Object.entries(menuEmpanadas)) {
    texto += `${key}. ${nombre}\n`;
  }
  texto += "\nCada empanada cuesta $1700.";
  return texto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuEmpanadas = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const seleccion = ctx.body;
      const currentPedido = await getPedidoActual(state);

      if (
        !validarSeleccion(seleccion, Object.keys(menuEmpanadas).map(Number))
      ) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-24)");
      }

      const opcion = parseInt(seleccion);
      const empanadaSeleccionada = menuEmpanadas[opcion];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: empanadaSeleccionada,
        },
      });

      await flowDynamic(`🥟 Has seleccionado *${empanadaSeleccionada}*.`);
      return "¿Cuántas unidades deseas?";
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
      const cantidad = parseInt(ctx.body);
      const currentPedido = await getPedidoActual(state);

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Ingresa un número válido (1 o más).");
      }

      const precioUnitario = 1700;
      const precioTotal = precioUnitario * cantidad;
      const nuevoItem = {
        nombre: currentPedido.ultimoProducto,
        cantidad,
        precioUnitario,
        precioTotal,
      };

      const nuevosItems = [...currentPedido.items, nuevoItem];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          items: nuevosItems,
          total: currentPedido.total + precioTotal,
          ultimoProducto: null,
        },
      });

      await flowDynamic(
        `✅ Agregadas ${cantidad} empanada(s) de *${nuevoItem.nombre}*\n` +
          `💰 Precio unitario: $${precioUnitario}\n` +
          `💵 Total por este ítem: $${precioTotal}\n` +
          `🛒 Total acumulado: $${currentPedido.total + precioTotal}`
      );

      return gotoFlow(require("./FlowAgregarmas"));
    }
  );

module.exports = flowMenuEmpanadas;
