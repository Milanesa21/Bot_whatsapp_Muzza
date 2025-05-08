const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowNombreCliente = require("./FlowNombrecliente");

const flowDetallesPedido = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Deseas agregar algún detalle específico en tu pedido? (por ejemplo, sin cebolla, bien cocido, etc.)",
  { capture: true },
  async (ctx, { gotoFlow, state }) => {
    // Añadimos state
    const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

    // Actualizamos el estado con los detalles del pedido
    await state.update({
      pedidoActual: {
        ...currentPedido,
        detalles: ctx.body,
      },
    });

    return gotoFlow(flowNombreCliente);
  }
);

module.exports = flowDetallesPedido;
