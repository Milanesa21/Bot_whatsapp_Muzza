const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas")

// Objeto con el menú de sándwiches
const menuSandwiches = {
  1: { nombre: "Hamburguesa Especial", precio: 9000 },
  2: { nombre: "Hamburguesa Completa", precio: 9500 },
  3: { nombre: "Sándwich de Pollo Especial", precio: 9500 },
  4: { nombre: "Sándwich de Pollo Completo", precio: 10000 },
  5: { nombre: "Alito de Carne Especial", precio: 12000 },
  6: { nombre: "Alito de Carne Completo", precio: 13000 }, 
  7: { nombre: "Alito de Pollo Especial", precio: 14000 },
  8: { nombre: "Alito de Pollo Completo", precio: 15000 },
  9: { nombre: "Tostado de Jamón y Queso", precio: 6000 },
};

// Función para generar el texto del menú
const generarMenuTexto = () => {
  let menuTexto = "🥪 *MENÚ DE SÁNDWICHES* 🥪\n\n";
  menuTexto += "Elige un sándwich:\n\n";
  for (const [key, value] of Object.entries(menuSandwiches)) {
    menuTexto += `${key}. ${value.nombre} ($${value.precio})\n`;
  }
  return menuTexto;
};

// Función para validar la selección del usuario
const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

// Flujo principal del menú de sándwiches
const flowMenuSandwiches = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
    const seleccion = ctx.body;

    if (!validarSeleccion(seleccion, Object.keys(menuSandwiches).map(Number))) {
      return fallBack("Por favor, selecciona una opción válida (1-9)");
    }

    const opcion = parseInt(seleccion);
    const item = menuSandwiches[opcion];

    // Agregar el ítem al pedido actual
    pedidoActual.items.push(item);
    pedidoActual.total += item.precio;

    await flowDynamic(
      `Has agregado ${item.nombre} - $${item.precio} a tu pedido. Total actual: $${pedidoActual.total}`
    );

    // Redirigir al flujo para agregar más ítems
    return gotoFlow(flowAgregarMas);
  }
);

module.exports =  flowMenuSandwiches ;
