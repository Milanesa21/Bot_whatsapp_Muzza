const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Objeto con el menú de sándwiches, hamburguesas, alitos y demás ítems (según el excel)
const menuSandwiches = {
  1: { nombre: "Hamburguesa Especial", precio: 9000 },
  2: { nombre: "Hamburguesa Completa", precio: 9500 },
  3: { nombre: "Sándwich de Pollo Especial", precio: 9500 },
  4: { nombre: "Sándwich de Pollo Completo", precio: 10000 },
  5: { nombre: "Alito de Pollo Especial", precio: 14000 },
  6: { nombre: "Alito de Pollo Completo", precio: 15000 },
  7: { nombre: "Tostado de Jamón y Queso", precio: 6000 },
  8: { nombre: "Sándwich de Miga x12", precio: 9000 },
  9: { nombre: "Sándwich de Miga de Verdura x12", precio: 6500 },
  10: { nombre: "Sándwich de Miga de Verdura x6", precio: 6000 },
  11: { nombre: "Sándwich Masa Madre Mini", precio: 2300 },
  12: { nombre: "Sándwich Masa Madre Verdura", precio: 5000 },
  13: { nombre: "Sándwich Pan Masa Madre", precio: 6000 },
  14: { nombre: "Sandwiche de Bondiola de Cerdo Clásico", precio: 8000 },
  15: { nombre: "Sandwiche de Bondiola de Cerdo Criolla", precio: 8500 },
};

// Función para generar el texto del menú
const generarMenuTexto = () => {
  let menuTexto = "🥪 *MENÚ DE SÁNDWICHES* 🥪\n\n";
  menuTexto += "Elige un sándwich, hamburguesa, alito o similar:\n\n";
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
        return fallBack("❌ Por favor, selecciona una opción válida (1-15)");
      }

      const opcion = parseInt(seleccion);
      const itemSeleccionado = menuSandwiches[opcion];

      // Guardamos temporalmente el producto seleccionado
      pedidoActual.ultimoProducto = itemSeleccionado;

      await flowDynamic(
        `🥪 Has seleccionado *${itemSeleccionado.nombre}* ($${itemSeleccionado.precio}).`
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

      const item = pedidoActual.ultimoProducto;
      const precioTotal = item.precio * cantidad;

      // Agregamos al pedido actual
      pedidoActual.items.push({
        nombre: item.nombre,
        cantidad,
        precioUnitario: item.precio,
        precioTotal,
      });

      pedidoActual.total += precioTotal;

      await flowDynamic(
        `✅ Has agregado ${cantidad} unidad(es) de *${item.nombre}*.\n` +
          `💰 Precio unitario: $${item.precio}\n` +
          `💵 Total por este ítem: $${precioTotal}\n\n` +
          `🛒 Total acumulado: $${pedidoActual.total}`
      );

      return gotoFlow(flowAgregarMas);
    }
  );

module.exports = flowMenuSandwiches;
