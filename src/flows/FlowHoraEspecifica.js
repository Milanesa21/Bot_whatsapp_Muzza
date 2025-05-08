const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowConfirmacionPedido = require("./FlowConfirmacion");

const flowHorarioEspecifico = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Para qué horario específico lo deseas? (Ej: 20:30)",
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
    // Añadimos state
    const horarioIngresado = ctx.body;
    const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

    if (/\d+[:]\d+/.test(horarioIngresado) || horarioIngresado.includes(":")) {
      // Actualizamos el estado con el nuevo horario
      await state.update({
        pedidoActual: {
          ...currentPedido,
          horario: horarioIngresado,
        },
      });

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

module.exports = flowHorarioEspecifico;
