const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowDetallesPedido = require("./FlowDetalles");

const flowDireccion = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, proporciona tu dirección completa para el delivery (calle, número, barrio, etc).",
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
    // Añadimos state
    const direccion = ctx.body.trim();
    const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

    // Validación básica de la dirección
    if (direccion.length < 5) {
      return fallBack(
        "Por favor, ingresa una dirección válida (calle, número, barrio, etc)."
      );
    }

    // Actualizar el estado con la nueva dirección
    await state.update({
      pedidoActual: {
        ...currentPedido,
        direccion: direccion,
      },
    });

    await flowDynamic(
      `Gracias. Tu dirección (${direccion}) ha sido registrada. Continuemos con tu pedido.\nRecuerda que el precio del delivery varia entre 1500 a 5000 dependiendo de la distancia`
    );

    return gotoFlow(flowDetallesPedido);
  }
);

module.exports = flowDireccion;
