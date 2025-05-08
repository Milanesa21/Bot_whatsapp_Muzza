const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

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
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuSandwiches = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const seleccion = ctx.body;
      const currentPedido = await getPedidoActual(state);

      if (
        !validarSeleccion(seleccion, Object.keys(menuSandwiches).map(Number))
      ) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-6)");
      }

      const opcion = parseInt(seleccion);
      const itemSeleccionado = menuSandwiches[opcion];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: itemSeleccionado,
        },
      });

      await flowDynamic(
        `🥪 Has seleccionado *${itemSeleccionado.nombre}* ($${itemSeleccionado.precio}).`
      );
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
        return fallBack("❌ Por favor, ingresa un número válido (1 o más).");
      }

      const item = currentPedido.ultimoProducto;
      const precioTotal = item.precio * cantidad;

      const nuevosItems = [
        ...currentPedido.items,
        {
          nombre: item.nombre,
          cantidad,
          precioUnitario: item.precio,
          precioTotal,
        },
      ];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          items: nuevosItems,
          total: currentPedido.total + precioTotal,
          ultimoProducto: null,
        },
      });

      const nuevoTotal = currentPedido.total + precioTotal;

      await flowDynamic(
        `✅ Has agregado ${cantidad} unidad(es) de *${item.nombre}*.\n` +
          `💰 Precio unitario: $${item.precio}\n` +
          `💵 Total por este ítem: $${precioTotal}\n\n` +
          `🛒 Total acumulado: $${nuevoTotal}`
      );

      return gotoFlow(require("./FlowAgregarmas"));
    }
  );

module.exports = flowMenuSandwiches;
