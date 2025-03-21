const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowMetodoPago = require("./FlowMetodoPago")

const flowNombreCliente = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, indica a nombre de quién estará el pedido",
  { capture: true },
  async (ctx, { gotoFlow }) => {
    pedidoActual.nombreCliente = ctx.body;
    return gotoFlow(flowMetodoPago);
  }
);

module.exports =  flowNombreCliente ;
