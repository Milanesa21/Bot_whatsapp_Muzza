const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Menú de bebidas basado en el excel: refrescos, aguas y cervezas
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
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowGaseosas = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const seleccion = ctx.body;
      if (!validarSeleccion(seleccion, Object.keys(menuBebidas).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-23).");
      }

      const opcion = parseInt(seleccion);
      const bebida = menuBebidas[opcion];

      // Guardamos temporalmente la bebida seleccionada
      pedidoActual.ultimoProducto = bebida;

      await flowDynamic(
        `🥤 Has seleccionado *${bebida.nombre}* ($${bebida.precio}).`
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

      const bebida = pedidoActual.ultimoProducto;
      const precioTotal = bebida.precio * cantidad;

      // Agregamos al pedido actual
      pedidoActual.items.push({
        nombre: bebida.nombre,
        cantidad,
        precioUnitario: bebida.precio,
        precioTotal,
      });

      pedidoActual.total += precioTotal;

      await flowDynamic(
        `✅ Has agregado ${cantidad} unidad(es) de *${bebida.nombre}*.\n` +
          `💰 Precio unitario: $${bebida.precio}\n` +
          `💵 Total por este ítem: $${precioTotal}\n\n` +
          `🛒 Total acumulado: $${pedidoActual.total}`
      );

      return gotoFlow(flowAgregarMas);
    }
  );

module.exports = flowGaseosas;
