const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { pedidoActual, resetPedido } = require("../utils/resetPedido");
const flowPrincipal = require("./FlowPrincipal");
const { client } = require("../../db");

const flowConfirmacionPedido = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    let resumen = [
      "🧾 *RESUMEN DE TU PEDIDO* 🧾",
      `👤 A nombre de: *${pedidoActual.nombreCliente}*`,
      "",
      "📋 *Productos:*",
    ];

    pedidoActual.items.forEach((item, index) => {
      resumen.push(`${index + 1}. ${item.nombre} - $${item.precio}`);
    });

    resumen = resumen.concat([
      "",
      `🚚 *Entrega:* ${
        pedidoActual.delivery ? "Delivery (+$1500)" : "Retiro en local"
      }`,
      pedidoActual.delivery ? `📍 *Dirección:* ${pedidoActual.direccion}` : "",
      `💰 *Método de pago:* ${pedidoActual.metodoPago}`,
      `⏰ *Horario:* ${pedidoActual.horario}`,
      `💲 *Total a pagar:* $${pedidoActual.total}`,
      "",
    ]);

    if (pedidoActual.detalles && pedidoActual.detalles.trim() !== "") {
      resumen.push(`📝 *Detalles:* ${pedidoActual.detalles}`);
    }

    await flowDynamic(resumen.join("\n"));
  })
  .addAnswer("¿Confirmas este pedido?")
  .addAnswer(
    ["1️⃣ Sí, confirmar pedido", "2️⃣ No, cancelar pedido"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("si")) {
        try {
          // Verificar que el campo "tipo" esté definido
          if (!pedidoActual.tipo) {
            throw new Error("El tipo de pedido no está definido.");
          }

          const query = `
            INSERT INTO pedidos (tipo, items, delivery, direccion, detalles, nombre_cliente, metodo_pago, horario, total)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `;
          const values = [
            pedidoActual.tipo,
            JSON.stringify(pedidoActual.items),
            pedidoActual.delivery,
            pedidoActual.direccion || null,
            pedidoActual.detalles,
            pedidoActual.nombreCliente,
            pedidoActual.metodoPago,
            pedidoActual.horario,
            pedidoActual.total,
          ];

          await client.query(query, values);
          console.log("Pedido guardado en la base de datos");

          await flowDynamic(
            [
              "✅ *¡Pedido confirmado!* ✅",
              "",
              "Tu pedido ha sido registrado con éxito.",
              pedidoActual.delivery
                ? `Te enviaremos tu pedido a la dirección: ${pedidoActual.direccion}`
                : "Puedes pasar a retirarlo por nuestro local.",
              "",
              "¡Gracias por tu compra! 😊",
            ].join("\n")
          );
        } catch (error) {
          console.error(
            "Error al guardar el pedido en la base de datos:",
            error
          );
          await flowDynamic(
            "Hubo un error al guardar tu pedido. Por favor, inténtalo de nuevo."
          );
        } finally {
          resetPedido();
          return;
        }
      } else if (respuesta.includes("2") || respuesta.includes("no")) {
        await flowDynamic(
          [
            "❌ *Pedido cancelado* ❌",
            "",
            "Has cancelado tu pedido. Puedes iniciar uno nuevo cuando lo desees.",
            "",
            "¡Gracias por contactarnos! 😊",
          ].join("\n")
        );
        resetPedido();
        return gotoFlow(flowPrincipal);
      } else {
        return fallBack(
          "Por favor, indica si confirmas (1) o cancelas (2) el pedido"
        );
      }
    }
  );

module.exports = flowConfirmacionPedido;
