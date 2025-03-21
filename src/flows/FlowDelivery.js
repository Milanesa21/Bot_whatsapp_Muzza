const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowDireccion = require("./FlowDireccion"); // Importar el nuevo flujo
const flowDetallesPedido = require("./FlowDetalles");

const flowDelivery = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Cómo deseas recibir tu pedido?")
  .addAnswer(
    [
      "1️⃣ Delivery a domicilio (+$1500)",
      "2️⃣ Paso a retirarlo personalmente",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("delivery")) {
        pedidoActual.delivery = true;
        pedidoActual.total += 1500;
        await flowDynamic(
          "Has seleccionado delivery a domicilio. Se ha agregado un cargo de $1500. Total actualizado: $" +
            pedidoActual.total
        );
        return gotoFlow(flowDireccion); // Redirigir a flowDireccion
      } else if (respuesta.includes("2") || respuesta.includes("retir")) {
        pedidoActual.delivery = false;
        pedidoActual.direccion = null; // Limpiar la dirección si no es delivery
        await flowDynamic(
          "Has seleccionado retirar personalmente. Total del pedido: $" +
            pedidoActual.total
        );
        return gotoFlow(flowDetallesPedido); // Continuar con el flujo normal
      } else {
        return fallBack(
          "Por favor, indica si deseas delivery (1) o retirarlo personalmente (2)"
        );
      }
    }
  );

module.exports = flowDelivery;
