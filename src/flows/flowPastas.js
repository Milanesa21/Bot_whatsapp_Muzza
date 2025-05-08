const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

const menuPastas = {
  // Salsas
  1: { nombre: "Salsa Bolognesa", precio: 2500, unidad: "porción" },
  2: { nombre: "Salsa Blanca", precio: 2200, unidad: "porción" },
  3: { nombre: "Salsa Filetto", precio: 2800, unidad: "porción" },
  4: { nombre: "Estofado de carne", precio: 3000, unidad: "porción" },
  5: { nombre: "Estofado de pollo", precio: 2800, unidad: "porción" },
  6: { nombre: "Salsa Pesto", precio: 3200, unidad: "porción" },

  // Pastas Frescas
  7: { nombre: "Ravioles de osobuco", precio: 4500, unidad: "paquete" },
  8: { nombre: "Ravioles de cordero", precio: 4800, unidad: "paquete" },
  9: { nombre: "Ravioles de Jamón y queso", precio: 4200, unidad: "paquete" },
  10: { nombre: "Ravioles de verduras", precio: 4000, unidad: "paquete" },
  11: {
    nombre: "Ravioles de ricota y nuez moscada",
    precio: 3800,
    unidad: "paquete",
  },
  12: {
    nombre: "Sorrentinos de cuatro quesos",
    precio: 4700,
    unidad: "paquete",
  },
  13: { nombre: "Sorrentinos de capresse", precio: 4600, unidad: "paquete" },
  14: {
    nombre: "Sorrentinos de muzza y calabaza",
    precio: 4500,
    unidad: "paquete",
  },
  15: {
    nombre: "Sorrentinos de pollo y verduras",
    precio: 4400,
    unidad: "paquete",
  },
  16: { nombre: "Ñoquis", precio: 3500, unidad: "paquete" },
  17: { nombre: "Fideos al morrón", precio: 1700, unidad: "paquete" },
  18: { nombre: "Fideos al huevo", precio: 1700, unidad: "paquete" },
  19: { nombre: "Fideos de espinaca", precio: 1700, unidad: "paquete" },
};

const generarMenuTexto = () => {
  let menuTexto = "🍝 *MENÚ DE PASTAS* 🧀\n\n";

  // Salsas
  menuTexto += "🍅 *Salsas:*\n";
  for (let i = 1; i <= 6; i++) {
    menuTexto += `${i}. ${menuPastas[i].nombre} - $${menuPastas[i].precio}\n`;
  }

  // Pastas Frescas
  menuTexto += "\n🍝 *Pastas Frescas:*\n";
  for (let i = 7; i <= 19; i++) {
    let precioText = `$${menuPastas[i].precio}`;
    if (i >= 17) precioText += " el paquete";
    menuTexto += `${i}. ${menuPastas[i].nombre} - ${precioText}\n`;
  }

  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowPastas = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const seleccion = ctx.body;
      const currentPedido = await getPedidoActual(state);

      if (!validarSeleccion(seleccion, Object.keys(menuPastas).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-19)");
      }

      const opcion = parseInt(seleccion);
      const producto = menuPastas[opcion];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: producto,
        },
      });

      await flowDynamic(`✅ Has seleccionado: *${producto.nombre}*`);
      return `¿Qué cantidad deseas? (Indica número de ${
        producto.unidad === "kg" ? "kilogramos" : producto.unidad
      }s)`;
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
      const cantidad = parseFloat(ctx.body.replace(",", "."));
      const currentPedido = await getPedidoActual(state);
      const producto = currentPedido.ultimoProducto;

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Ingresa una cantidad válida (ej: 1, 0.5, 2)");
      }

      const precioTotal = producto.precio * cantidad;
      const nuevoItem = {
        nombre: `${producto.nombre} (${cantidad} ${producto.unidad})`,
        cantidad,
        precioUnitario: producto.precio,
        precioTotal: Math.round(precioTotal),
        unidad: producto.unidad,
      };

      const nuevosItems = [...currentPedido.items, nuevoItem];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          items: nuevosItems,
          total: currentPedido.total + nuevoItem.precioTotal,
          ultimoProducto: null,
        },
      });

      await flowDynamic(
        `🛒 Agregado: ${cantidad} ${producto.unidad} de *${producto.nombre}*\n` +
          `💰 Precio: $${producto.precio} por ${producto.unidad}\n` +
          `💵 Total parcial: $${nuevoItem.precioTotal}\n` +
          `📦 Total acumulado: $${currentPedido.total + nuevoItem.precioTotal}`
      );

      return gotoFlow(require("./FlowAgregarmas"));
    }
  );

module.exports = flowPastas;
