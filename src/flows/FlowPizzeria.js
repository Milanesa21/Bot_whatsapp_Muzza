const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowSeleccionTamaño = require("./FlowSeleccionTamaño");
const flowAgregarMas = require("./FlowAgregarmas");

// Objeto con el menú de pizzas principales (excluyendo “Pizza libre”)
const menuPizzas = {
  1: {
    nombre: "Muzzarella",
    precioChica: 16100, // PIZZA MUZZARELLA CHICA: $16,100.0
    precioGrande: 18400, // PIZZA MUZZARELLA: $18,400.0
  },
  2: {
    nombre: "Rúcula",
    precioChica: 19550, // PIZZA RUCULA CHICA: $19,550.0
    precioGrande: 21850, // PIZZA RUCULA: $21,850.0
  },
  3: {
    nombre: "Rúcula y Jamón Crudo",
    precioChica: 21850, // PIZZA RUCULA Y JAMON CRUDO CHICA: $21,850.0
    precioGrande: 24150, // PIZZA RUCULA Y JAMON CRUDO: $24,150.0
  },
  4: {
    nombre: "Jamón Crudo",
    precioChica: 20700, // PIZZA JAMON CRUDO CHICA: $20,700.0
    precioGrande: 23000, // PIZZA JAMON CRUDO: $23,000.0
  },
  5: {
    nombre: "Especial",
    precioChica: 18400, // PIZZA ESPECIAL CHICA: $18,400.0
    precioGrande: 20700, // PIZZA ESPECIAL: $20,700.0
  },
  6: {
    nombre: "Completa",
    precioChica: 18400, // PIZZA COMPLETA CHICA: $18,400.0
    precioGrande: 21850, // PIZZA COMPLETA: $21,850.0
  },
  7: {
    nombre: "Capresse",
    precioChica: 17250, // PIZZA CAPRESSE CHICA: $17,250.0
    precioGrande: 19550, // PIZZA CAPRESSE: $19,550.0
  },
  8: {
    nombre: "Muzza Picante",
    precioChica: 16100, // PIZZA MUZZA PICANTE CHICA: $16,100.0
    precioGrande: 18400, // PIZZA MUZZA PICANTE: $18,400.0
  },
  9: {
    nombre: "Jamón, Morrones y Huevo",
    precioChica: 19550, // PIZZA JAMON MORRONES Y HUEVO CHICA: $19,550.0
    precioGrande: 21850, // PIZZA JAMON MORRONES Y HUEVO: $21,850.0
  },
  10: {
    nombre: "Jamón, Morrones y Palmitos",
    precioChica: 25300, // PIZZA JAMON MORRONES Y PALMITOS CHICA: $25,300.0
    precioGrande: 27600, // PIZZA JAMON MORRONES Y PALMITOS: $27,600.0
  },
  11: {
    nombre: "Champignon",
    precioChica: 21850, // PIZZA CHAMPIGNON CHICA: $21,850.0
    precioGrande: 23000, // PIZZA CHAMPIGNON: $23,000.0
  },
  12: {
    nombre: "Tomate, Calabresa y Salsa Picante",
    precioChica: 19550, // PIZZA TOMATE CALABRESA Y SALSA PICANTE CHICA: $19,550.0
    precioGrande: 21850, // PIZZA TOMATE CALABRESA Y SALSA PICANTE: $21,850.0
  },
  13: {
    nombre: "Tomate, Jamón y Huevo",
    precioChica: 19550, // Se asume que PIZZA TOMATE JAMON Y HUEVO CHICA es $19,550.0
    precioGrande: 21850, // PIZZA TOMATE JAMON Y HUEVO: $21,850.0
  },
  14: {
    nombre: "Anchoas",
    precioChica: 20700, // PIZZA ANCHOAS CHICA: $20,700.0
    precioGrande: 23000, // PIZZA ANCHOAS: $23,000.0
  },
  15: {
    nombre: "Palmitos",
    precioChica: 20700, // Se asume similar a “Anchoas” para chica: $20,700.0
    precioGrande: 23000, // PIZZA PALMITOS: $23,000.0
  },
  16: {
    nombre: "Cuatro Quesos",
    precioChica: 18400, // PIZZA CUATRO QUESOS CHICA: $18,400.0
    precioGrande: 25300, // PIZZA CUATRO QUESOS: $25,300.0
  },
  17: {
    nombre: "Muzza",
    precioChica: 25300, // PIZZA MUZZA (diferente a Muzzarella) – chica: $25,300.0
    precioGrande: 27600, // PIZZA MUZZA – grande: $27,600.0
  },
  18: {
    nombre: "Napolitana y Jamón",
    precioChica: 19550, // PIZZA NAPOLITANA Y JAMON CHICA: $19,550.0
    precioGrande: 21850, // PIZZA NAPOLITANA Y JAMON: $21,850.0
  },
  19: {
    nombre: "Fugazzeta",
    precioChica: 18400, // PIZZA FUGAZZETA CHICA: $18,400.0
    precioGrande: 20700, // PIZZA FUGAZZETA: $20,700.0
  },
  20: {
    nombre: "Fugazzeta y Jamón",
    precioChica: 19550, // PIZZA FUGAZZETA Y JAMON CHICA: $19,550.0
    precioGrande: 21850, // PIZZA FUGAZZETA Y JAMON: $21,850.0
  },
  21: {
    nombre: "Calabresa",
    precioChica: 19550, // PIZZA CALABRESA CHICA: $19,550.0
    precioGrande: 21850, // PIZZA CALABRESA: $21,850.0
  },
  22: {
    nombre: "Roquefort",
    precioChica: 18400, // PIZZA ROQUEFORT CHICA: $18,400.0
    precioGrande: 20700, // PIZZA ROQUEFORT: $20,700.0
  },
  23: {
    nombre: "Pollo a la Barbacoa",
    precioChica: 20700, // PIZZA POLLO A LA BARBACOA CHICA: $20,700.0
    precioGrande: 23000, // PIZZA POLLO A LA BARBACOA: $23,000.0
  },
};

// Función para generar el texto del menú principal
const generarMenuTexto = () => {
  let menuTexto = "🍕 *MENÚ DE PIZZERÍA* 🍕\n\n";
  menuTexto += "Las pizzas son 100% artesanales. Elige una opción:\n\n";
  for (const [key, value] of Object.entries(menuPizzas)) {
    if (key <= 23) {
      menuTexto += `${key}. ${value.nombre} (Chica: $${value.precioChica} - Grande: $${value.precioGrande})\n`;
    }
  }
  return menuTexto;
};

// Función para validar la selección del usuario
const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

// Flujo principal del menú de pizzas
const flowMenuPizzeria = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const seleccion = ctx.body;

      if (!validarSeleccion(seleccion, Object.keys(menuPizzas).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-23)");
      }

      const opcion = parseInt(seleccion);
      const pizzaSeleccionada = menuPizzas[opcion];

      pedidoActual.ultimoProducto = pizzaSeleccionada;
      await flowDynamic(`🍕 Has seleccionado *${pizzaSeleccionada.nombre}*.`);
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const cantidad = parseInt(ctx.body);

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Ingresa un número válido (1 o más)");
      }

      pedidoActual.ultimaCantidad = cantidad;
      await flowDynamic(
        `🛒 Vas a pedir ${cantidad} pizza(s) de *${pedidoActual.ultimoProducto.nombre}*.`
      );
    }
  )
  .addAnswer(
    "¿Qué tamaño deseas?\n\n1. Chica\n2. Grande",
    { capture: true },
    async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
      const seleccionTamaño = ctx.body.toLowerCase();
      const pizza = pedidoActual.ultimoProducto;
      const cantidad = pedidoActual.ultimaCantidad;

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

      pedidoActual.items.push({
        nombre: pizza.nombre,
        cantidad,
        tamaño,
        precioUnitario,
        precioTotal,
      });

      pedidoActual.total += precioTotal;

      await flowDynamic(
        `✅ Agregado: ${cantidad}x ${pizza.nombre} (${tamaño})\n` +
          `💵 $${precioUnitario} c/u → Total: $${precioTotal}\n` +
          `🛒 Total acumulado: $${pedidoActual.total}`
      );

      return gotoFlow(flowAgregarMas);
    }
  );

module.exports = flowMenuPizzeria;
