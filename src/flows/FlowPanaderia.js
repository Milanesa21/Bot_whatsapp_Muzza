const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");

// Menú de panadería como una lista única numerada
const menuPanaderia = {
  1: { nombre: "Medialunas", precio: 500 },
  2: { nombre: "Pan de leche", precio: 600 },
  3: { nombre: "Bollos", precio: 700 },
  4: { nombre: "Tortitas negras", precio: 800 },
  5: { nombre: "Chipitas", precio: 900 },
  6: { nombre: "Pan blanco", precio: 1000 },
  7: { nombre: "Pan integral", precio: 1100 },
  8: { nombre: "Baguette", precio: 1200 },
  9: { nombre: "Cremonas", precio: 1300 },
  10: { nombre: "Bizcochitos saborizados", precio: 1400 },
  11: { nombre: "Pan de campo", precio: 1500 },
  12: { nombre: "Sándwich de masa madre", precio: 1600 },
  13: { nombre: "Sacramento", precio: 1700 },
  14: { nombre: "Miqueletos", precio: 1800 },
  15: { nombre: "Mbejú", precio: 1900 },
  16: { nombre: "Mbejú relleno", precio: 2000 },
  17: { nombre: "Pan rallado", precio: 2100 },
  18: { nombre: "Sopa paraguaya", precio: 2200 },
  19: { nombre: "Chipa guazú", precio: 2300 },
  20: { nombre: "Chipa soo", precio: 2400 },
  21: { nombre: "Bizcochos de manteca", precio: 2500 },
  22: { nombre: "Grisines de hojaldre", precio: 2600 },
  23: { nombre: "Grisines de integral", precio: 2700 },
  24: { nombre: "Pan de hamburguesa", precio: 2800 },
  25: { nombre: "Pan de pancho", precio: 2900 },
  26: { nombre: "Prepizzas", precio: 3000 },
  27: { nombre: "Bocaditos clásicos e integrales", precio: 3100 },
  28: { nombre: "Tostadas", precio: 3200 },
  29: { nombre: "Papas", precio: 3300 },
  30: { nombre: "Galletitas", precio: 3400 },
  31: { nombre: "Galletitas con chips", precio: 3500 },
  32: { nombre: "Pastafloras", precio: 3600 },
  33: { nombre: "Palmeritas", precio: 3700 },
  34: { nombre: "Alfajorcitos de maicena", precio: 3800 },
  35: { nombre: "Alfajores de hojaldre", precio: 3900 },
  36: { nombre: "Budines", precio: 4000 },
  37: { nombre: "Tortas", precio: 4100 },
  38: { nombre: "Sándwich de miga (Clásico)", precio: 4200 },
  39: { nombre: "Sándwich de miga (Integral)", precio: 4300 },
  40: { nombre: "Sándwich de miga (Verdura)", precio: 4400 },
  41: { nombre: "Conitos de dulce de leche", precio: 4500 },
  42: { nombre: "Marineras", precio: 4600 },
  43: { nombre: "Pascualinas", precio: 4700 },
  44: { nombre: "Zapallitos de membrillo", precio: 4800 },
  45: { nombre: "Sándwich de miga Clásico", precio: 7000 },
  46: { nombre: "Sándwich de miga Integral", precio: 7500 },
  47: { nombre: "Sándwich de miga Verdura", precio: 8000 },
};

// Función para generar el texto del menú
const generarMenuTexto = () => {
  let menuTexto = "🥐 *MENÚ DE PANADERÍA* 🥐\n\n";
  menuTexto += "Elige un producto por número o nombre:\n\n";

  for (const [key, producto] of Object.entries(menuPanaderia)) {
    menuTexto += `${key}. ${producto.nombre} - $${producto.precio}\n`;
  }

  return menuTexto;
};

// Función para encontrar producto por nombre o número
const encontrarProducto = (seleccion) => {
  // Intentar como número
  if (!isNaN(parseInt(seleccion)) && menuPanaderia[parseInt(seleccion)]) {
    return menuPanaderia[parseInt(seleccion)];
  }

  // Intentar como nombre (ignorando mayúsculas/minúsculas)
  const seleccionLowerCase = seleccion.toLowerCase().trim();

  // Búsqueda exacta
  for (const producto of Object.values(menuPanaderia)) {
    if (producto.nombre.toLowerCase().trim() === seleccionLowerCase) {
      return producto;
    }
  }

  // Búsqueda parcial (si contiene)
  for (const producto of Object.values(menuPanaderia)) {
    if (producto.nombre.toLowerCase().includes(seleccionLowerCase)) {
      return producto;
    }
  }

  return null;
};

// Flujo principal del menú de panadería
const flowMenuPanaderia = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
    const seleccion = ctx.body;
    const productoSeleccionado = encontrarProducto(seleccion);

    if (!productoSeleccionado) {
      return fallBack(
        "No encontré ese producto. Por favor, selecciona un producto válido por nombre o número."
      );
    }

    // Agregar el ítem al pedido actual
    pedidoActual.items.push(productoSeleccionado);
    pedidoActual.total += productoSeleccionado.precio;

    await flowDynamic(
      `Has agregado ${productoSeleccionado.nombre} - $${productoSeleccionado.precio} a tu pedido. Total actual: $${pedidoActual.total}`
    );

    // Redirigir al flujo para agregar más ítems
    const flowAgregarMas = require("./FlowAgregarmas"); // Importar aquí para evitar dependencia circular
    return gotoFlow(flowAgregarMas);
  }
);

module.exports = flowMenuPanaderia;
