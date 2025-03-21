const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowNombreCliente = require("./FlowNombrecliente")

const flowDetallesPedido = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Deseas agregar algún detalle específico en tu pedido? (por ejemplo, sin cebolla, bien cocido, etc.)",
  { capture: true },
  async (ctx, { gotoFlow }) => {
    pedidoActual.detalles = ctx.body;
    return gotoFlow(flowNombreCliente);
  }
);

module.exports =  flowDetallesPedido ;
