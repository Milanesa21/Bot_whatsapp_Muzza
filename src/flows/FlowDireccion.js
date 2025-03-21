const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowDetallesPedido = require("./FlowDetalles");

const flowDireccion = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, proporciona tu dirección completa para el delivery (calle, número, barrio, etc).",
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
    const direccion = ctx.body.trim();

    // Validación básica de la dirección
    if (direccion.length < 5) {
      return fallBack(
        "Por favor, ingresa una dirección válida (calle, número, barrio, etc)."
      );
    }

    // Guardar la dirección en pedidoActual
    pedidoActual.direccion = direccion;

    await flowDynamic(
      `Gracias. Tu dirección (${direccion}) ha sido registrada. Continuemos con tu pedido.`
    );

    // Redirigir al siguiente flujo
    return gotoFlow(flowDetallesPedido);
  }
);

module.exports = flowDireccion;
