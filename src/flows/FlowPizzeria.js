const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowCantidad = require("./FlowCantidad");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const menuPizzas = {
  1: { nombre: "Muzzarella", precioChica: 16100, precioGrande: 18400 },
  2: { nombre: "Rúcula", precioChica: 19550, precioGrande: 21850 },
  3: {
    nombre: "Rúcula y Jamón Crudo",
    precioChica: 21850,
    precioGrande: 24150,
  },
  4: { nombre: "Jamón Crudo", precioChica: 20700, precioGrande: 23000 },
  5: { nombre: "Especial", precioChica: 18400, precioGrande: 20700 },
  6: { nombre: "Completa", precioChica: 18400, precioGrande: 21850 },
  7: { nombre: "Capresse", precioChica: 17250, precioGrande: 19550 },
  8: { nombre: "Muzza Picante", precioChica: 16100, precioGrande: 18400 },
  9: {
    nombre: "Jamón, Morrones y Huevo",
    precioChica: 19550,
    precioGrande: 21850,
  },
  10: {
    nombre: "Jamón, Morrones y Palmitos",
    precioChica: 25300,
    precioGrande: 27600,
  },
  11: { nombre: "Champignon", precioChica: 21850, precioGrande: 23000 },
  12: {
    nombre: "Tomate, Calabresa y Salsa Picante",
    precioChica: 19550,
    precioGrande: 21850,
  },
  13: {
    nombre: "Tomate, Jamón y Huevo",
    precioChica: 19550,
    precioGrande: 21850,
  },
  14: { nombre: "Anchoas", precioChica: 20700, precioGrande: 23000 },
  15: { nombre: "Palmitos", precioChica: 20700, precioGrande: 23000 },
  16: { nombre: "Cuatro Quesos", precioChica: 18400, precioGrande: 25300 },
  17: { nombre: "Muzza", precioChica: 25300, precioGrande: 27600 },
  18: { nombre: "Napolitana y Jamón", precioChica: 19550, precioGrande: 21850 },
  19: { nombre: "Fugazzeta", precioChica: 18400, precioGrande: 20700 },
  20: { nombre: "Fugazzeta y Jamón", precioChica: 19550, precioGrande: 21850 },
  21: { nombre: "Calabresa", precioChica: 19550, precioGrande: 21850 },
  22: { nombre: "Roquefort", precioChica: 18400, precioGrande: 20700 },
  23: {
    nombre: "Pollo a la Barbacoa",
    precioChica: 20700,
    precioGrande: 23000,
  },
};

const generarMenuTexto = () => {
  let menuTexto = "🍕 *MENÚ DE PIZZERÍA* 🍕\n\n";
  menuTexto += "Las pizzas son 100% artesanales. Elige una opción:\n\n";
  for (const [key, { nombre, precioChica, precioGrande }] of Object.entries(
    menuPizzas
  )) {
    menuTexto += `${key}. ${nombre} (Chica: $${precioChica} - Grande: $${precioGrande})\n`;
  }
  menuTexto += "\n0. Cancelar y volver al menú principal";
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuPizzeria = addKeyword(EVENTS.ACTION)
  // Paso 1: Selección de pizza
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
      const seleccion = ctx.body.trim();

      if (seleccion === "0") {
        await flowDynamic(
          "🚫 Operación cancelada. Volviendo al menú principal."
        );
        return gotoFlow(flowSeleccionMenu);
      }

      const opcionesValidas = Object.keys(menuPizzas).map(Number);
      if (!validarSeleccion(seleccion, opcionesValidas)) {
        return fallBack("❌ Opción inválida. Elige del 1 al 23");
      }

      const pizza = menuPizzas[parseInt(seleccion)];
      await state.update({
        pedidoActual: {
          ...(await getPedidoActual(state)),
          ultimoProducto: pizza,
        },
      });

      await flowDynamic(`🍕 Seleccionaste: *${pizza.nombre}*`);

      // ¡Ahora enviamos el mensaje del tamaño aquí, solo si la selección es válida!
      await flowDynamic("¿Qué tamaño deseas?\n1. Chica\n2. Grande");

      // No necesitamos gotoFlow aquí, el flujo continuará automáticamente al siguiente addAnswer
    }
  )

  // Paso 2: Capturar la respuesta del tamaño (¡Sin mensaje inicial aquí!)
  .addAnswer(
    "🍕🍕🍕",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
      const seleccion = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state);
      const pizza = currentPedido.ultimoProducto;

      if (!pizza) {
        await flowDynamic("❌ Error: Pizza no detectada");
        return gotoFlow(flowSeleccionMenu);
      }

      let tamaño, precio;
      if (seleccion === "1" || seleccion.includes("chica")) {
        tamaño = "Chica";
        precio = pizza.precioChica;
      } else if (seleccion === "2" || seleccion.includes("grande")) {
        tamaño = "Grande";
        precio = pizza.precioGrande;
      } else {
        return fallBack("❌ Respuesta inválida. Elige 1 o 2");
      }

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: {
            nombre: `${pizza.nombre} (${tamaño})`,
            precio: precio,
          },
        },
      });

      return gotoFlow(require("./FlowCantidad"));
    }
  );

module.exports = flowMenuPizzeria;