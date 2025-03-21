const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowConfirmacionPedido = require("./FlowConfirmacion")


const flowHorarioEspecifico = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Para qué horario específico lo deseas? (Ej: 20:30)",
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic }) => {
    const horarioIngresado = ctx.body;

    if (/\d+[:]\d+/.test(horarioIngresado) || horarioIngresado.includes(":")) {
      pedidoActual.horario = horarioIngresado;
      await flowDynamic(
        `Perfecto, tu pedido será para las ${horarioIngresado}`
      );
      return gotoFlow(flowConfirmacionPedido);
    } else {
      await flowDynamic("Por favor, ingresa un horario válido (Ej: 20:30)");
      return fallBack();
    }
  }
);

module.exports =  flowHorarioEspecifico ;
