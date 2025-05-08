const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

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
  27: { nombre: "Sandwiches de miga clásicos x6", precio: 5000, unidad: "unidad" },
  28: { nombre: "Sandwiches de miga integral x6", precio: 6000, unidad: "unidad" },
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

  return menuTexto;
};

const validarSeleccion = (seleccion, opciones) => {
  const opcion = parseInt(seleccion);
  return !isNaN(opcion) && opciones.includes(opcion);
};

const flowPanaderia = addKeyword(EVENTS.ACTION)
  .addAnswer(
    generarMenuTexto(),
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state }) => {
      const seleccion = ctx.body;
      const currentPedido = await getPedidoActual(state);

      if (!validarSeleccion(seleccion, Object.keys(menuPanaderia).map(Number))) {
        return fallBack("❌ Por favor, selecciona una opción válida (1-29)");
      }

      const opcion = parseInt(seleccion);
      const producto = menuPanaderia[opcion];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          ultimoProducto: producto
        }
      });

      await flowDynamic(`✅ Has seleccionado: *${producto.nombre}*`);
      return "¿Cuántas unidades deseas?";
    }
  )
  .addAnswer(
    "Ingresa la cantidad:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
      const cantidad = parseInt(ctx.body);
      const currentPedido = await getPedidoActual(state);
      const producto = currentPedido.ultimoProducto;

      if (isNaN(cantidad) || cantidad <= 0) {
        return fallBack("❌ Ingresa un número válido (ej: 1, 2, 3...)");
      }

      const precioTotal = producto.precio * cantidad;
      const nuevoItem = {
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
        precioTotal: precioTotal,
        unidad: "unidad"
      };

      const nuevosItems = [...currentPedido.items, nuevoItem];

      await state.update({
        pedidoActual: {
          ...currentPedido,
          items: nuevosItems,
          total: currentPedido.total + precioTotal,
          ultimoProducto: null
        }
      });

      await flowDynamic(
        `🛒 Agregado: ${cantidad} unidad(es) de *${producto.nombre}*\n` +
        `💰 Precio unitario: $${producto.precio}\n` +
        `💵 Total parcial: $${precioTotal}\n` +
        `📦 Total acumulado: $${currentPedido.total + precioTotal}`
      );

      return gotoFlow(flowAgregarMas);
    }
  );

module.exports = flowPanaderia;