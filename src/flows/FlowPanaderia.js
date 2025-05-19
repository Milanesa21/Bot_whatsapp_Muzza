const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowCantidad = require("./FlowCantidad");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const menuPanaderia = {
  1: { nombre: "Palmeritas", precio: 3000, unidad: "unidad" },
  2: { nombre: "Donas (bandeja x4)", precio: 3500, unidad: "bandeja" },
  3: { nombre: "Pepas", precio: 3000, unidad: "unidad" },
  4: { nombre: "Alfajores de Maicena x6", precio: 2300, unidad: "unidad" },
  5: { nombre: "Alfajores de Maicena x12", precio: 4100, unidad: "unidad" },
  6: { nombre: "Pastafrola de batata", precio: 2300, unidad: "unidad" },
  7: { nombre: "Pastafrola de membrillo", precio: 2300, unidad: "unidad" },
  8: { nombre: "Budín", precio: 3500, unidad: "unidad" },
  9: { nombre: "Muffin", precio: 2000, unidad: "unidad" },
  10: { nombre: "Roll de frutos rojos", precio: 4500, unidad: "unidad" },

  11: { nombre: "Bizcochos de manteca (kg)", precio: 9200, unidad: "kg" },
  12: { nombre: "Grisines (kg)", precio: 9200, unidad: "kg" },
  13: { nombre: "Bocaditos (kg)", precio: 9200, unidad: "kg" },

  14: { nombre: "Facturas x docena", precio: 9200, unidad: "docena" },
  15: { nombre: "Facturas x media docena", precio: 4600, unidad: "media docena" },
  16: { nombre: "Facturas x unidad", precio: 950, unidad: "unidad" },
  17: {
    nombre: "Variadas c/medialunas x docena",
    precio: 9200,
    unidad: "docena",
  },
  18: {
    nombre: "Variadas s/medialunas x docena",
    precio: 9200,
    unidad: "docena",
  },

  19: { nombre: "Pan de leche x unidad", precio: 950, unidad: "unidad" },
  20: { nombre: "Pan de leche x docena", precio: 9200, unidad: "docena" },

  21: { nombre: "Miguelitos x unidad", precio: 950, unidad: "unidad" },
  22: { nombre: "Miguelitos x docena", precio: 9200, unidad: "docena" },

  23: { nombre: "Chipitas (kg)", precio: 11000, unidad: "kg" },
  24: { nombre: "Chipa con muzza (kg)", precio: 17250, unidad: "unidad" },
  25: { nombre: "Bizcochos saborizados (kg)", precio: 9200, unidad: "kg" },
  26: { nombre: "Sacramentos", precio: 3500, unidad: "unidad" },

  27: { nombre: "Pan de campo (masa madre)", precio: 2500, unidad: "unidad" },
  28: { nombre: "Pan baguette (masa madre)", precio: 1800, unidad: "unidad" },
  29: { nombre: "Pan integral", precio: 3000, unidad: "unidad" },
  30: { nombre: "Pan blanco", precio: 2500, unidad: "unidad" },

  31: { nombre: "Sandwiches de masa madre", precio: 6000, unidad: "unidad" },
  32: {
    nombre: "Sandwiches de miga clásicos x6",
    precio: 5000,
    unidad: "unidad",
  },
  33: {
    nombre: "Sandwiches de miga integral x6",
    precio: 6000,
    unidad: "unidad",
  },
  34: { nombre: "Sandwiches de miga verduras", precio: 6000, unidad: "unidad" },
};



const generarMenuTexto = () => {
  let menuTexto = "🥐 *MENÚ DE PANADERÍA* 🥖\n\n";
  menuTexto += "Productos con unidad/especificación aclarada:\n\n";
  menuTexto += "🍱 *Bandejitas y dulces:*\n";
  for (let i = 1; i <= 9; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio}\n`;
  }

  menuTexto += "\n🍞 *Masas secas saladas:*\n";
  for (let i = 10; i <= 12; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio}\n`;
  }

  menuTexto += "\n🏪 *Productos varios:*\n";
  for (let i = 13; i <= 33; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio}\n`;
  }

  menuTexto += "\n0. Cancelar y volver al menú principal";
  return menuTexto;
};


const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowPanaderia = addKeyword(EVENTS.ACTION).addAnswer(
  generarMenuTexto(),
  { capture: true },
  async (ctx, { flowDynamic, fallBack, state, gotoFlow }) => {
    const seleccion = ctx.body.trim();

    if (seleccion === "0") {
      await flowDynamic("🚫 Operación cancelada. Volviendo al menú principal.");
      return gotoFlow(require("./FlowSeleccionMenu"));
    }

    const opcionesValidas = Object.keys(menuPanaderia).map(Number);
    if (!validarSeleccion(seleccion, opcionesValidas)) {
      return fallBack("❌ Por favor, selecciona una opción válida (0-29)");
    }

    const opcion = parseInt(seleccion);
    const producto = menuPanaderia[opcion];
    const currentPedido = await getPedidoActual(state);

    await state.update({
      pedidoActual: {
        ...currentPedido,
        ultimoProducto: producto, 
      },
    });

    await flowDynamic(`✅ Has seleccionado: *${producto.nombre}*`);
    return gotoFlow(require("./FlowCantidad")); 
  }
);

module.exports = flowPanaderia;
