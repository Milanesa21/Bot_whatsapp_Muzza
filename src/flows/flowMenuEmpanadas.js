const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");

// Menú de empanadas numerado
const menuEmpanadas = {
  1: "Empanada de Jamón y Queso",
  2: "Empanada de Roquefort",
  3: "Empanada de Champiñón",
  4: "Empanada de Pollo",
  5: "Empanada de Napolitana",
  6: "Empanada de Palmitos",
  7: "Empanada de Huevos",
  8: "Empanada de Muzzarella",
  9: "Empanada de Choclo",
  10: "Empanada de Cebolla",
  11: "Empanada de Verduras",
  12: "Empanada de Fontina",
  13: "Empanada de Capresse",
  14: "Empanada Árabes",
  15: "Empanada de Charque",
  16: "Empanada de Calabresa",
  17: "Empanadas de Carne",
  18: "Empanada de Osobuco",
  19: "Empanada de Maturre",
  20: "Empanada de Vacío y Provoleta",
  21: "Empanada de Carne Dulce",
  22: "Empanada de Carne Picante",
  23: "Empanada de Carne y Pasas",
  24: "Empanada de Carne y Aceitunas",
};

const generarMenuTexto = () => {
  let texto = "🥟 *MENÚ DE EMPANADAS* 🥟\n\n";
  texto += "Elige una opción por número:\n\n";
  for (const [key, nombre] of Object.entries(menuEmpanadas)) {
    texto += `${key}. ${nombre}\n`;
  }
  texto += "\nCada empanada cuesta $1500.";
  return texto;
};

const flowMenuEmpanadas = addKeyword(EVENTS.ACTION)
  .addAnswer(generarMenuTexto(), { capture: true }, async (ctx, { flowDynamic, fallBack }) => {
    const seleccion = parseInt(ctx.body);
    if (!menuEmpanadas[seleccion]) {
      return fallBack("❌ Opción no válida. Ingresa el número de la empanada que deseas.");
    }
    // Guardamos la selección en el pedido actual para usarla en el siguiente paso
    pedidoActual.ultimoProducto = menuEmpanadas[seleccion];
    return `🥟 Has seleccionado *${menuEmpanadas[seleccion]}*. ¿Cuántas unidades deseas?`;
  })
  .addAnswer("Ingresa la cantidad:", { capture: true }, async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
    const cantidad = parseInt(ctx.body);
    if (isNaN(cantidad) || cantidad <= 0) {
      return fallBack("❌ Ingresa un número válido.");
    }
    const empanadaSeleccionada = pedidoActual.ultimoProducto;
    const precioTotal = 1500 * cantidad;
    pedidoActual.items.push({ nombre: empanadaSeleccionada, cantidad, precio: precioTotal });
    pedidoActual.total += precioTotal;
    await flowDynamic(`Agregaste ${cantidad} *${empanadaSeleccionada}* por un total de $${precioTotal}.`);
    return gotoFlow(flowAgregarMas);
  });

module.exports = flowMenuEmpanadas;
