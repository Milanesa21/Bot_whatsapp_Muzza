const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido"); // Cambiamos la importación
const flowConfirmacionPedido = require("./FlowConfirmacion");

/**
 * Valida que el horario esté dentro del rango permitido (08:00 - 00:00)
 * @param {string} horario - Horario en formato HH:MM
 * @returns {boolean} - true si el horario está dentro del rango, false en caso contrario
 */
const esHorarioValido = (horario) => {
  // Verificamos que sea un formato de horario válido
  if (!horario || !horario.includes(":")) {
    return false;
  }

  try {
    const [horas, minutos] = horario
      .split(":")
      .map((num) => parseInt(num.trim(), 10));

    // Validamos que sean números válidos
    if (isNaN(horas) || isNaN(minutos)) {
      return false;
    }

    // Validamos que estén en rangos correctos
    if (minutos < 0 || minutos > 59) {
      return false;
    }

    // Verificamos que esté dentro del horario de atención (08:00 - 00:00)
    if (horas === 0) {
      // Medianoche (00:00)
      return true;
    }

    if (horas >= 8 && horas <= 23) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const flowHorarioEspecifico = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Para qué horario específico lo deseas? (Horario de atención: 08:00 - 00:00)",
  { capture: true },
  async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
    // Añadimos state
    const horarioIngresado = ctx.body;
    const currentPedido = await getPedidoActual(state); // Obtenemos el estado actual

    // Primero verificamos si tiene formato de horario
    if (/\d+[:]\d+/.test(horarioIngresado) || horarioIngresado.includes(":")) {
      // Ahora validamos que esté dentro del horario permitido
      if (esHorarioValido(horarioIngresado)) {
        // Actualizamos el estado con el nuevo horario
        await state.update({
          pedidoActual: {
            ...currentPedido,
            horario: horarioIngresado,
          },
        });

        await flowDynamic(
          `✅ Perfecto, tu pedido será para las ${horarioIngresado}`
        );
        return gotoFlow(flowConfirmacionPedido);
      } else {
        await flowDynamic(
          "⚠️ Lo siento, solo realizamos pedidos entre las 08:00 y las 00:00.\nPor favor, ingresa un horario dentro de nuestro horario de atención."
        );
        return fallBack();
      }
    } else {
      await flowDynamic(
        "❌ Por favor, ingresa un horario válido en formato HH:MM (Ej: 20:30)"
      );
      return fallBack();
    }
  }
);

module.exports = flowHorarioEspecifico;
