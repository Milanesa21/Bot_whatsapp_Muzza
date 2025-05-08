const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowDireccion = require("./FlowDireccion");
const flowDetallesPedido = require("./FlowDetalles");

const flowDelivery = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Cómo deseas recibir tu pedido?")
  .addAnswer(
    [
      "1️⃣ Delivery a domicilio",
      "2️⃣ Retirar personalmente",
      "\n*El costo delivery varia entre 1500 a 5000 dependiendo de la distancia del viaje*",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
      const respuesta = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state);

      if (respuesta.includes("1") || respuesta.includes("delivery")) {
        await state.update({
          pedidoActual: {
            ...currentPedido,
            delivery: true,
          },
        });

        await flowDynamic(
          "🚚 Has seleccionado delivery a domicilio. \n" +
            "Por favor indica tu dirección en el siguiente paso."
        );
        return gotoFlow(flowDireccion);
      } else if (respuesta.includes("2") || respuesta.includes("retir")) {
        await state.update({
          pedidoActual: {
            ...currentPedido,
            delivery: false,
            direccion: null,
          },
        });

        await flowDynamic(
          "🏪 Retiro en local confirmado \n" +
            "Dirección: Sarmiento 1314, entre Salta y Ayacucho\n" +
            `Total del pedido: $${currentPedido.total}`
        );
        return gotoFlow(flowDetallesPedido);
      } else {
        return fallBack(
          "Por favor selecciona:\n" +
            "1. Delivery a domicilio\n" +
            "2. Retirar personalmente"
        );
      }
    }
  );

module.exports = flowDelivery;
