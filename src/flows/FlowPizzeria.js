const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowSeleccionTamaño = require("./FlowSeleccionTamaño");
const flowAgregarMas = require("./FlowAgregarmas");

const menuPizzas = {
  1: {
    nombre: "Muzzarella",
    precioChica: 16100,
    precioGrande: 18400,
  },
  2: {
    nombre: "Rúcula",
    precioChica: 19550,
    precioGrande: 21850,
  },
  3: {
    nombre: "Rúcula y Jamón Crudo",
    precioChica: 21850,
    precioGrande: 24150,
  },
  4: {
    nombre: "Jamón Crudo",
    precioChica: 20700,
    precioGrande: 23000,
  },
  5: {
    nombre: "Especial",
    precioChica: 18400,
    precioGrande: 20700,
  },
  6: {
    nombre: "Completa",
    precioChica: 18400,
    precioGrande: 21850,
  },
  7: {
    nombre: "Capresse",
    precioChica: 17250,
    precioGrande: 19550,
  },
  8: {
    nombre: "Muzza Picante",
    precioChica: 16100,
    precioGrande: 18400,
  },
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
  11: {
    nombre: "Champignon",
    precioChica: 21850,
    precioGrande: 23000,
  },
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
  14: {
    nombre: "Anchoas",
    precioChica: 20700,
    precioGrande: 23000,
  },
  15: {
    nombre: "Palmitos",
    precioChica: 20700,
    precioGrande: 23000,
  },
  16: {
    nombre: "Cuatro Quesos",
    precioChica: 18400,
    precioGrande: 25300,
  },
  17: {
    nombre: "Muzza",
    precioChica: 25300,
    precioGrande: 27600,
  },
  18: {
    nombre: "Napolitana y Jamón",
    precioChica: 19550,
    precioGrande: 21850,
  },
  19: {
    nombre: "Fugazzeta",
    precioChica: 18400,
    precioGrande: 20700,
  },
  20: {
    nombre: "Fugazzeta y Jamón",
    precioChica: 19550,
    precioGrande: 21850,
  },
  21: {
    nombre: "Calabresa",
    precioChica: 19550,
    precioGrande: 21850,
  },
  22: {
    nombre: "Roquefort",
    precioChica: 18400,
    precioGrande: 20700,
  },
  23: {
    nombre: "Pollo a la Barbacoa",
    precioChica: 20700,
    precioGrande: 23000,
  },
};

const generarMenuTexto = () => {
  let menuTexto = "🍕 *MENÚ DE PIZZERÍA* 🍕\n\n";
  menuTexto += "Las pizzas son 100% artesanales. Elige una opción:\n\n";
  for (const [key, value] of Object.entries(menuPizzas)) {
    menuTexto += `${key}. ${value.nombre} (Chica: $${value.precioChica} - Grande: $${value.precioGrande})\n`;
  }
  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowMenuPizzeria = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const seleccion = ctx.body;
      const currentPedido = await getPedidoActual(state);

      if (!validarSeleccion(seleccion, Object.keys(menuPizzas).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-23)");
      }

      const opcion = parseInt(seleccion);
      const pizzaSeleccionada = menuPizzas[opcion];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: pizzaSeleccionada,
        },
      });

      await flowDynamic(`🍕 Has seleccionado *${pizzaSeleccionada.nombre}*.`);
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const cantidad = parseInt(ctx.body);
      const currentPedido = await getPedidoActual(state);

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Ingresa un número válido (1 o más)");
      }

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimaCantidad: cantidad,
        },
      });

      await flowDynamic(
        `🛒 Vas a pedir ${cantidad} pizza(s) de *${currentPedido.ultimoProducto.nombre}*.`
      );
    }
  )
  .addAnswer(
    "¿Qué tamaño deseas?\n\n1. Chica\n2. Grande",
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow, fallBack, state }) => {
      const seleccionTamaño = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state);
      const pizza = currentPedido.ultimoProducto;
      const cantidad = currentPedido.ultimaCantidad;

      let tamaño, precioUnitario;

      if (seleccionTamaño.match(/1|chica/i)) {
        tamaño = "Chica";
        precioUnitario = pizza.precioChica;
      } else if (seleccionTamaño.match(/2|grande/i)) {
        tamaño = "Grande";
        precioUnitario = pizza.precioGrande;
      } else {
        return fallBack("❌ Selecciona 1 (Chica) o 2 (Grande)");
      }

      const precioTotal = precioUnitario * cantidad;
      const nuevosItems = [
        ...currentPedido.items,
        {
          nombre: pizza.nombre,
          cantidad,
          tamaño,
          precioUnitario,
          precioTotal,
        },
      ];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          items: nuevosItems,
          total: currentPedido.total + precioTotal,
          ultimoProducto: null,
          ultimaCantidad: null,
        },
      });

      await flowDynamic(
        `✅ Agregado: ${cantidad}x ${pizza.nombre} (${tamaño})\n` +
          `💵 $${precioUnitario} c/u → Total: $${precioTotal}\n` +
          `🛒 Total acumulado: $${currentPedido.total + precioTotal}`
      );

      return gotoFlow(require("./FlowAgregarmas"));
    }
  );

module.exports = flowMenuPizzeria;
