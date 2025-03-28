const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Objeto con el menú de sándwiches
const menuSandwiches = {
  1: { nombre: "Hamburguesa Especial", precio: 9000 },
  2: { nombre: "Hamburguesa Completa", precio: 9500 },
  3: { nombre: "Sándwich de Pollo Especial", precio: 9500 },
  4: { nombre: "Sándwich de Pollo Completo", precio: 10000 },
  5: { nombre: "Alito de Pollo Especial", precio: 14000 },
  6: { nombre: "Alito de Pollo Completo", precio: 15000 },
  7: { nombre: "Tostado de Jamón y Queso", precio: 6000 },
};

// Función para generar el texto del menú
const generarMenuTexto = () => {
  let menuTexto = "🥪 *MENÚ DE SÁNDWICHES* 🥪\n\n";
  menuTexto += "Elige un sándwich:\n\n";
  for (const [key, value] of Object.entries(menuSandwiches)) {
    menuTexto += `${key}. ${value.nombre} - $${value.precio}\n`;
  }
  return menuTexto;
};

// Función para validar la selección del usuario
const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

// Flujo principal del menú de sándwiches
const flowMenuSandwiches = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const seleccion = ctx.body;

      if (
        !validarSeleccion(seleccion, Object.keys(menuSandwiches).map(Number))
      ) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-9)");
      }

      const opcion = parseInt(seleccion);
      const sandwich = menuSandwiches[opcion];

      // Guardamos temporalmente el sándwich seleccionado
      pedidoActual.ultimoProducto = sandwich;

      await flowDynamic(
        `🥪 Has seleccionado *${sandwich.nombre}* ($${sandwich.precio}).`
      );
      return "¿Cuántas unidades deseas?";
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
      const cantidad = parseInt(ctx.body);

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Por favor, ingresa un número válido (1 o más).");
      }

      const sandwich = pedidoActual.ultimoProducto;
      const precioTotal = sandwich.precio * cantidad;

      // Agregamos al pedido actual
      pedidoActual.items.push({
        nombre: sandwich.nombre,
        cantidad,
        precioUnitario: sandwich.precio,
        precioTotal,
      });

      pedidoActual.total += precioTotal;

      await flowDynamic(
        `✅ Has agregado ${cantidad} unidad(es) de *${sandwich.nombre}*.\n` +
          `💰 Precio unitario: $${sandwich.precio}\n` +
          `💵 Total por este ítem: $${precioTotal}\n\n` +
          `🛒 Total acumulado: $${pedidoActual.total}`
      );

      return gotoFlow(flowAgregarMas);
    }
  );

module.exports = flowMenuSandwiches;
