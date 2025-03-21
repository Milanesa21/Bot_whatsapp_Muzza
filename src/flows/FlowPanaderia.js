const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Objeto con el menú de panadería
const menuPanaderia = {
  1: {
    nombre: "Facturas",
    productos: [
      { nombre: "Medialunas", precio: 500 },
      { nombre: "Pan de leche", precio: 600 },
      { nombre: "Bollos", precio: 700 },
      { nombre: "Tortitas negras", precio: 800 },
      { nombre: "Chipitas", precio: 900 },
      { nombre: "Pan blanco", precio: 1000 },
      { nombre: "Pan integral", precio: 1100 },
      { nombre: "Baguette", precio: 1200 },
      { nombre: "Cremonas", precio: 1300 },
      { nombre: "Bizcochitos saborizados", precio: 1400 },
      { nombre: "Pan de campo", precio: 1500 },
      { nombre: "Sándwich de masa madre", precio: 1600 },
      { nombre: "Sacramento", precio: 1700 },
      { nombre: "Miqueletos", precio: 1800 },
      { nombre: "Mbejú", precio: 1900 },
      { nombre: "Mbejú relleno", precio: 2000 },
      { nombre: "Pan rallado", precio: 2100 },
      { nombre: "Sopa paraguaya", precio: 2200 },
      { nombre: "Chipa guazú", precio: 2300 },
      { nombre: "Chipa soo", precio: 2400 },
    ],
  },
  2: {
    nombre: "Grisines",
    productos: [
      { nombre: "Bizcochos de manteca", precio: 2500 },
      { nombre: "Grisines de hojaldre", precio: 2600 },
      { nombre: "Grisines de integral", precio: 2700 },
      { nombre: "Pan de hamburguesa", precio: 2800 },
      { nombre: "Pan de pancho", precio: 2900 },
      { nombre: "Prepizzas", precio: 3000 },
      { nombre: "Bocaditos clásicos e integrales", precio: 3100 },
      { nombre: "Tostadas", precio: 3200 },
      { nombre: "Papas", precio: 3300 },
      { nombre: "Galletitas", precio: 3400 },
      { nombre: "Galletitas con chips", precio: 3500 },
      { nombre: "Pastafloras", precio: 3600 },
      { nombre: "Palmeritas", precio: 3700 },
      { nombre: "Alfajorcitos de maicena", precio: 3800 },
      { nombre: "Alfajores de hojaldre", precio: 3900 },
      { nombre: "Budines", precio: 4000 },
      { nombre: "Tortas", precio: 4100 },
      { nombre: "Sándwich de miga (Clásico)", precio: 4200 },
      { nombre: "Sándwich de miga (Integral)", precio: 4300 },
      { nombre: "Sándwich de miga (Verdura)", precio: 4400 },
      { nombre: "Conitos de dulce de leche", precio: 4500 },
      { nombre: "Marineras", precio: 4600 },
      { nombre: "Pascualinas", precio: 4700 },
      { nombre: "Zapallitos de membrillo", precio: 4800 },
    ],
  },
  3: {
    nombre: "Sándwich de miga",
    productos: [
      { nombre: "Clásico", precio: 7000 },
      { nombre: "Integral", precio: 7500 },
      { nombre: "Verdura", precio: 8000 },
    ],
  },
};

// Función para generar el texto del menú
const generarMenuTexto = () => {
  let menuTexto = "🥐 *MENÚ DE PANADERÍA* 🥐\n\n";
  menuTexto += "Elige una categoría:\n\n";
  for (const [key, value] of Object.entries(menuPanaderia)) {
    menuTexto += `${key}. ${value.nombre}\n`;
  }
  return menuTexto;
};

// Función para generar el texto de los productos de una categoría
const generarProductosTexto = (productos) => {
  let productosTexto = "Elige un producto:\n\n";
  productos.forEach((producto, index) => {
    productosTexto += `${index + 1}. ${producto.nombre} - $${
      producto.precio
    }\n`;
  });
  return productosTexto;
};

// Función para validar la selección del usuario
const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

// Flujo principal del menú de panadería
const flowMenuPanaderia = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
    const seleccion = ctx.body;

    if (!validarSeleccion(seleccion, Object.keys(menuPanaderia).map(Number))) {
      return fallBack("Por favor, selecciona una opción válida (1-3)");
    }

    const opcion = parseInt(seleccion);
    const categoria = menuPanaderia[opcion];

    await flowDynamic(
      generarProductosTexto(categoria.productos),
      { capture: true },
      async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
        const seleccionProducto = ctx.body;

        if (
          !validarSeleccion(
            seleccionProducto,
            categoria.productos.map((_, index) => index + 1)
          )
        ) {
          return fallBack(
            `Por favor, selecciona un producto válido (1-${categoria.productos.length})`
          );
        }

        const productoSeleccionado =
          categoria.productos[parseInt(seleccionProducto) - 1];

        // Agregar el ítem al pedido actual
        pedidoActual.items.push(productoSeleccionado);
        pedidoActual.total += productoSeleccionado.precio;

        await flowDynamic(
          `Has agregado ${productoSeleccionado.nombre} - $${productoSeleccionado.precio} a tu pedido. Total actual: $${pedidoActual.total}`
        );

        // Redirigir al flujo para agregar más ítems
        return gotoFlow(flowAgregarMas);
      }
    );
  }
);

module.exports =  flowMenuPanaderia ;
