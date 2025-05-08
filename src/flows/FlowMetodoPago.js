const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowHorario = require("./FlowHorario");

const flowMetodoPago = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Cómo deseas pagar?")
  .addAnswer(
    ["1️⃣ Efectivo", "2️⃣ Transferencia"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic, state }) => {
      // Añadimos state
      const respuesta = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

      let metodoPago = null;

      if (respuesta.includes("1") || respuesta.includes("efectivo")) {
        metodoPago = "Efectivo";
      } else if (respuesta.includes("2") || respuesta.includes("transf")) {
        metodoPago = "Transferencia";
      } else {
        return fallBack(
          "Por favor, indica si pagarás con efectivo (1) o transferencia (2)"
        );
      }

      // Actualizar el estado con el método de pago
      await state.update({
        pedidoActual: {
          ...currentPedido,
          metodoPago: metodoPago,
        },
      });

      if (metodoPago === "Transferencia") {
        await flowDynamic(
          `💳 Para pagar con transferencia, realiza el pago al alias *AGUSTINO.FSA* \n` +
            `Recuerda que al confirmar tu pedido, se te volverá a mostrar el alias para que completes la transferencia.`
        );
      }

      return gotoFlow(flowHorario);
    }
  );

module.exports = flowMetodoPago;
