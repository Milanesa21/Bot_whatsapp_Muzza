const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowSeleccionTamaño = require("./FlowSeleccionTamaño")

// Objeto con el menú de pizzas principales
const menuPizzas = {
  1: { nombre: "Muzzarella", precioChica: 14000, precioGrande: 16000 },
  2: { nombre: "Doble Muzzarella", precioChica: 17000, precioGrande: 19000 },
  3: { nombre: "Rúcula", precioChica: 17000, precioGrande: 19000 },
  4: {
    nombre: "Rúcula y Jamón Crudo",
    precioChica: 19000,
    precioGrande: 21000,
  },
  5: { nombre: "Jamón Crudo", precioChica: 18000, precioGrande: 20000 },
  6: { nombre: "Especial", precioChica: 16000, precioGrande: 18000 },
  7: { nombre: "Completa", precioChica: 17000, precioGrande: 19000 },
  8: { nombre: "Capresse", precioChica: 15000, precioGrande: 17000 },
  9: { nombre: "Pepperoni", precioChica: 16000, precioGrande: 18000 },
  10: { nombre: "Muzza Picante", precioChica: 14000, precioGrande: 16000 },
  11: { nombre: "Otras Variedades" },
  12: {
    nombre: "Jamón, Morrones y Huevo",
    precioChica: 19000,
    precioGrande: 21000,
  },
  13: {
    nombre: "Jamón, Morrones y Palmitos",
    precioChica: 22000,
    precioGrande: 24000,
  },
  14: { nombre: "Champignon", precioChica: 18000, precioGrande: 20000 },
  15: {
    nombre: "Tomate, Calabresa y Salsa Picante",
    precioChica: 16000,
    precioGrande: 18000,
  },
  16: {
    nombre: "Tomate, Jamón y Huevo",
    precioChica: 18000,
    precioGrande: 20000,
  },
  17: { nombre: "Anchoas", precioChica: 18000, precioGrande: 20000 },
  18: { nombre: "Palmitos", precioChica: 18000, precioGrande: 20000 },
  19: { nombre: "Cuatro Quesos", precioChica: 22000, precioGrande: 24000 },
  20: { nombre: "Muzza", precioChica: 22000, precioGrande: 24000 },
  21: { nombre: "Napolitana y Jamón", precioChica: 17000, precioGrande: 19000 },
  22: { nombre: "Fugazzeta", precioChica: 16000, precioGrande: 18000 },
  23: { nombre: "Fugazzeta y Jamón", precioChica: 18000, precioGrande: 20000 },
  24: { nombre: "Muzza Especial", precioChica: 20000, precioGrande: 22000 },
  25: { nombre: "Calabresa", precioChica: 17000, precioGrande: 19000 },
  26: { nombre: "Roquefort", precioChica: 18000, precioGrande: 20000 },
  27: {
    nombre: "Ciruela a la Tocineta",
    precioChica: 20000,
    precioGrande: 22000,
  },
  28: {
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
    if (key <= 10) {
      menuTexto += `${key}. ${value.nombre} (Chica: $${value.precioChica} - Grande: $${value.precioGrande})\n`;
    } else {
      menuTexto += `${key}. ${value.nombre} (Consultar precios)\n`;
    }
  }
  return menuTexto;
};

// Función para generar el texto de las otras variedades
const generarOtrasVariedadesTexto = () => {
  let menuTexto = "🍕 *OTRAS VARIEDADES* 🍕\n\n";
  menuTexto += "Elige una opción:\n\n";
  for (const [key, value] of Object.entries(otrasVariedades)) {
    menuTexto += `${key}. ${value.nombre} (Chica: $${value.precioChica} - Grande: $${value.precioGrande})\n`;
  }
  return menuTexto;
};

// Función para validar la selección del usuario
const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

// Flujo principal del menú de pizzas
const flowMenuPizzeria = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
    const seleccion = ctx.body;

    if (!validarSeleccion(seleccion, Object.keys(menuPizzas).map(Number))) {
      return fallBack("Por favor, selecciona una opción válida (1-11)");
    }

    const opcion = parseInt(seleccion);

    if (opcion === 11) {
      await flowDynamic(
        generarOtrasVariedadesTexto(),
        { capture: true },
        async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
          const seleccionVariedad = ctx.body;

          if (
            !validarSeleccion(
              seleccionVariedad,
              Object.keys(otrasVariedades).map(Number)
            )
          ) {
            return fallBack("Por favor, selecciona una opción válida (12-28)");
          }

          const item = otrasVariedades[seleccionVariedad];
          pedidoActual.items.push(item);

          await flowDynamic(
            `Has seleccionado ${item.nombre}. ¿Qué tamaño deseas?\n\n` +
              "1. Chica\n" +
              "2. Grande"
          );
          return gotoFlow(flowSeleccionTamaño);
        }
      );
    } else {
      const item = menuPizzas[opcion];
      pedidoActual.items.push(item);

      await flowDynamic(
        `Has seleccionado ${item.nombre}. ¿Qué tamaño deseas?\n\n` +
          "1. Chica\n" +
          "2. Grande"
      );
      return gotoFlow(flowSeleccionTamaño);
    }
  }
);

module.exports =  flowMenuPizzeria ;
