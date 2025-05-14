const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowCantidad = require("./FlowCantidad");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const menuPanaderia = {
  1: { nombre: "Palmeritas", precio: 3000, unidad: "unidad" },
  2: { nombre: "Donas", precio: 3000, unidad: "unidad" },
  3: { nombre: "Pepas", precio: 3000, unidad: "unidad" },
  4: { nombre: "Alfajores de Maicena x6", precio: 2300, unidad: "unidad" },
  5: { nombre: "Alfajores de Maicena x12", precio: 4100, unidad: "unidad" },
  6: { nombre: "Pastafrolas (B o M)", precio: 2300, unidad: "unidad" },
  7: { nombre: "Budines", precio: 3000, unidad: "unidad" },
  8: { nombre: "Muffins", precio: 3000, unidad: "unidad" },
  9: { nombre: "Roll de frutos rojos", precio: 3000, unidad: "unidad" },
  10: { nombre: "Bizcochos de manteca", precio: 9200, unidad: "unidad" },
  11: { nombre: "Grisines (variedades)", precio: 9200, unidad: "unidad" },
  12: { nombre: "Bocaditos", precio: 9200, unidad: "unidad" },
  13: { nombre: "Facturas", precio: 9200, unidad: "unidad" },
  14: { nombre: "Medialunas", precio: 9200, unidad: "unidad" },
  15: { nombre: "Bollos", precio: 9200, unidad: "unidad" },
  16: { nombre: "Pan de leche", precio: 9200, unidad: "unidad" },
  17: { nombre: "Miguelitos", precio: 9200, unidad: "unidad" },
  18: { nombre: "Chipitas", precio: 11000, unidad: "unidad" },
  19: { nombre: "Chipa con Muzza", precio: 17250, unidad: "unidad" },
  20: { nombre: "Bizcochos saborizados", precio: 9200, unidad: "unidad" },
  21: { nombre: "Sacramentos", precio: 3500, unidad: "unidad" },
  22: { nombre: "Pan de campo (masa madre)", precio: 2500, unidad: "unidad" },
  23: { nombre: "Pan baguette (masa madre)", precio: 1750, unidad: "unidad" },
  24: { nombre: "Pan integral", precio: 3000, unidad: "unidad" },
  25: { nombre: "Pan blanco", precio: 2500, unidad: "unidad" },
  26: { nombre: "Sandwiches de masa madre", precio: 6000, unidad: "unidad" },
  27: {
    nombre: "Sandwiches de miga clásicos x6",
    precio: 5000,
    unidad: "unidad",
  },
  28: {
    nombre: "Sandwiches de miga integral x6",
    precio: 6000,
    unidad: "unidad",
  },
  29: { nombre: "Sandwiches de miga verduras", precio: 6000, unidad: "unidad" },
};

const generarMenuTexto = () => {
  let menuTexto = "🥐 *MENÚ DE PANADERÍA* 🥖\n\n";
  menuTexto += "Todos los productos se venden por unidad\n\n";
  menuTexto += "🍱 *Bandejitas y dulces:*\n";
  for (let i = 1; i <= 9; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio} c/u\n`;
  }
  menuTexto += "\n🍞 *Masas secas saladas:*\n";
  for (let i = 10; i <= 12; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio} c/u\n`;
  }
  menuTexto += "\n🏪 *Productos varios:*\n";
  for (let i = 13; i <= 29; i++) {
    menuTexto += `${i}. ${menuPanaderia[i].nombre} - $${menuPanaderia[i].precio} c/u\n`;
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
