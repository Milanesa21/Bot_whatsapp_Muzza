const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas")

const flowSeleccionTamaño = addKeyword(EVENTS.ACTION).addAction(
  { capture: true },
  async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
    const seleccionTamaño = ctx.body.toLowerCase();
    const item = pedidoActual.items[pedidoActual.items.length - 1];

    if (seleccionTamaño.includes("1") || seleccionTamaño.includes("chica")) {
      item.precio = item.precioChica;
      item.tamaño = "Chica";
    } else if (
      seleccionTamaño.includes("2") ||
      seleccionTamaño.includes("grande")
    ) {
      item.precio = item.precioGrande;
      item.tamaño = "Grande";
    } else {
      return fallBack(
        "Por favor, selecciona un tamaño válido: 1 (Chica) o 2 (Grande)"
      );
    }

    pedidoActual.total += item.precio;

    await flowDynamic(
      `Has agregado ${item.nombre} (${item.tamaño}) - $${item.precio} a tu pedido. Total actual: $${pedidoActual.total}`
    );

    return gotoFlow(flowAgregarMas);
  }
);

module.exports =  flowSeleccionTamaño ;
