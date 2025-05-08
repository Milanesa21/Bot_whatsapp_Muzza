const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowMetodoPago = require("./FlowMetodoPago");

const flowNombreCliente = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, indica a nombre de quién estará el pedido",
  { capture: true },
  async (ctx, { gotoFlow, state }) => {
    // Añadimos state como parámetro
    const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

    // Actualizamos el estado con el nuevo nombre
    await state.update({
      pedidoActual: {
        ...currentPedido,
        nombreCliente: ctx.body,
      },
    });

    return gotoFlow(flowMetodoPago);
  }
);

module.exports = flowNombreCliente;
