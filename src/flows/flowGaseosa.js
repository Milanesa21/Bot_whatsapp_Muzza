const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Menú de gaseosas y aguas saborizadas
const menuGaseosas = {
  1: { nombre: "PEPSI CLASICA GASEOSA 1,5 litro", precio: 3800 },
  2: { nombre: "PEPSI SIN AZUCAR GASEOSA 1,5 litro", precio: 3800 },
  3: { nombre: "SEVEN UP (7'UP) GASEOSA 1,5 litro", precio: 3800 },
  4: { nombre: "MIRINDA NARANJA GASEOSA 1,5 litro", precio: 3800 },
  5: { nombre: "COCA-FANTA-SPRITE GASEOSA Grande", precio: 6300 },
  6: { nombre: "COCA COLA - FANTA - SPRITE 1 litro", precio: 6000 },
  7: { nombre: "COCA COLA - FANTA - SPRITE 500 ml", precio: 4000 },
  8: { nombre: "AGUARIUS Agua Saborizada", precio: 2700 },
  9: { nombre: "AGUA SIN GAS Botella 600 ml", precio: 2000 },
  10: { nombre: "AGUA CON GAS Botella 600 ml", precio: 2000 },
  11: { nombre: "CERVEZA PATAGONIA AMBER 730 ml", precio: 5900 },
  12: { nombre: "CERVEZA CORONA 710 ml", precio: 5900 },
  13: { nombre: "CERVEZA CORONA 330 ml", precio: 5000 },
  14: { nombre: "CERVEZA STELLA ARTOIS 1 litro", precio: 6700 },
  15: { nombre: "CERVEZA STELLA ARTOIS 710ml", precio: 5900 },
  16: { nombre: "CERVEZA BRAHMA 1 litro", precio: 4100 },
};

const generarMenuTexto = () => {
  let menuTexto = "🥤 *MENÚ DE GASEOSAS Y AGUAS SABORIZADAS Y GASEOSAS* 🥤\n\n";
  menuTexto += "Elige una opción:\n\n";
  for (const [key, value] of Object.entries(menuGaseosas)) {
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
      if (!validarSeleccion(seleccion, Object.keys(menuGaseosas).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-20).");
      }

      const opcion = parseInt(seleccion);
      const bebida = menuGaseosas[opcion];

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
