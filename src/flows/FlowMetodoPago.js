const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowHorario = require("./FlowHorario")

const flowMetodoPago = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Cómo deseas pagar?")
  .addAnswer(
    ["1️⃣ Efectivo", "2️⃣ Transferencia"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("efectivo")) {
        pedidoActual.metodoPago = "Efectivo";
        return gotoFlow(flowHorario);
      } else if (respuesta.includes("2") || respuesta.includes("transf")) {
        pedidoActual.metodoPago = "Transferencia";
        return gotoFlow(flowHorario);
      } else {
        return fallBack(
          "Por favor, indica si pagarás con efectivo (1) o transferencia (2)"
        );
      }
    }
  );

module.exports = flowMetodoPago ;
