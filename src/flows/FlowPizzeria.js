const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowSeleccionTamaño = require("./FlowSeleccionTamaño");
const flowAgregarMas = require("./FlowAgregarmas");

// Objeto con el menú de pizzas principales
const menuPizzas = {
  1: { nombre: "Muzzarella", precioChica: 14000, precioGrande: 16000 },
  2: { nombre: "Rúcula", precioChica: 17000, precioGrande: 19000 },
  3: {
    nombre: "Rúcula y Jamón Crudo",
    precioChica: 19000,
    precioGrande: 21000,
  },
  4: { nombre: "Jamón Crudo", precioChica: 18000, precioGrande: 20000 },
  5: { nombre: "Especial", precioChica: 16000, precioGrande: 18000 },
  6: { nombre: "Completa", precioChica: 17000, precioGrande: 19000 },
  7: { nombre: "Capresse", precioChica: 15000, precioGrande: 17000 },
  8: { nombre: "Muzza Picante", precioChica: 14000, precioGrande: 16000 },
  9: {
    nombre: "Jamón, Morrones y Huevo",
    precioChica: 19000,
    precioGrande: 21000,
  },
  10: {
    nombre: "Jamón, Morrones y Palmitos",
    precioChica: 22000,
    precioGrande: 24000,
  },
  11: { nombre: "Champignon", precioChica: 18000, precioGrande: 20000 },
  12: {
    nombre: "Tomate, Calabresa y Salsa Picante",
    precioChica: 16000,
    precioGrande: 18000,
  },
  13: {
    nombre: "Tomate, Jamón y Huevo",
    precioChica: 18000,
    precioGrande: 20000,
  },
  14: { nombre: "Anchoas", precioChica: 18000, precioGrande: 20000 },
  15: { nombre: "Palmitos", precioChica: 18000, precioGrande: 20000 },
  16: { nombre: "Cuatro Quesos", precioChica: 22000, precioGrande: 24000 },
  17: { nombre: "Muzza", precioChica: 22000, precioGrande: 24000 },
  18: { nombre: "Napolitana y Jamón", precioChica: 17000, precioGrande: 19000 },
  19: { nombre: "Fugazzeta", precioChica: 16000, precioGrande: 18000 },
  20: { nombre: "Fugazzeta y Jamón", precioChica: 18000, precioGrande: 20000 },
  21: { nombre: "Calabresa", precioChica: 17000, precioGrande: 19000 },
  22: { nombre: "Roquefort", precioChica: 18000, precioGrande: 20000 },
  23: {
    nombre: "Pollo a la Barbacoa",
    precioChica: 18000,
    precioGrande: 20000,
  },
};

// Función para generar el texto del menú principal
const generarMenuTexto = () => {
  let menuTexto = "🍕 *MENÚ DE PIZZERÍA* 🍕\n\n";
  menuTexto += "Las pizzas son 100% artesanales. Elige una opción:\n\n";
  for (const [key, value] of Object.entries(menuPizzas)) {
    if (key <= 23) {
      menuTexto += `${key}. ${value.nombre} (Chica: $${value.precioChica} - Grande: $${value.precioGrande})\n`;
  }}
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