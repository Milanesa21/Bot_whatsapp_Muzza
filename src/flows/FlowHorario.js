const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual } = require("../utils/resetPedido");
const flowHorarioEspecifico = require("./FlowHoraEspecifica")
const flowConfirmacionPedido = require("./FlowConfirmacion")

const flowHorario = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Para qué horario deseas tu pedido?")
  .addAnswer(
    ["1️⃣ Lo antes posible", "2️⃣ Para un horario específico"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("antes")) {
        pedidoActual.horario = "Lo antes posible";
        return gotoFlow(flowConfirmacionPedido);
      } else if (respuesta.includes("2") || respuesta.includes("especifico")) {
        return gotoFlow(flowHorarioEspecifico);
      } else {
        await flowDynamic(
          "Por favor, selecciona una opción válida: 1 (Lo antes posible) o 2 (Para un horario específico)"
        );
        return fallBack();
      }
    }
  );

module.exports =  flowHorario ;
