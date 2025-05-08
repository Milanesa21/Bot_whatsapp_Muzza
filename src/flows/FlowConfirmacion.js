const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual, resetPedido } = require("../utils/resetPedido");
const flowPrincipal = require("./FlowPrincipal");
const { client } = require("../../db");
const { getIO } = require("../../socket");

const flowConfirmacionPedido = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic, state }) => {
    // Añadir state
    const currentPedido = await getPedidoActual(state); // Obtener estado actual
    let resumen = [
      "🧾 *RESUMEN DE TU PEDIDO* 🧾",
      `👤 A nombre de: *${currentPedido.nombreCliente}*`,
      "",
      "📋 *Productos:*",
    ];

    currentPedido.items.forEach((item, index) => {
      const cantidad = item.cantidad || 1;
      const precioTotal =
        item.precioTotal || item.precio * cantidad || item.precio;

      resumen.push(
        `${index + 1}. ${item.nombre}` +
          `\n   Cantidad: ${cantidad}` +
          `\n   Precio unitario: $${item.precioUnitario || item.precio}` +
          `\n   Subtotal: $${precioTotal}`
      );
    });

    resumen = resumen.concat([
      "",
      `🚚 *Entrega:* ${
        currentPedido.delivery ? "Delivery" : "Retiro en local"
      }`,
      currentPedido.delivery
        ? `📍 *Dirección:* ${currentPedido.direccion}`
        : "",
      `💰 *Método de pago:* ${currentPedido.metodoPago}`,
      `⏰ *Horario:* ${currentPedido.horario}`,
      `💲 *Total a pagar:* $${currentPedido.total}`,
      "",
    ]);

    if (currentPedido.detalles && currentPedido.detalles.trim() !== "") {
      resumen.push(`📝 *Detalles:* ${currentPedido.detalles}`);
    }
    await flowDynamic(resumen.join("\n"));
  })
  .addAnswer("¿Confirmas este pedido?")
  .addAnswer(
    ["1️⃣ Sí, confirmar pedido", "2️⃣ No, cancelar pedido"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
      // Añadir state
      const respuesta = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state);

      if (respuesta.includes("1") || respuesta.includes("si")) {
        try {
          const query = `
            INSERT INTO pedidos (
              tipo, items, delivery, direccion, detalles,
              nombre_cliente, metodo_pago, horario, total
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;
          const values = [
            currentPedido.tipo,
            JSON.stringify(currentPedido.items),
            currentPedido.delivery,
            currentPedido.direccion || null,
            currentPedido.detalles,
            currentPedido.nombreCliente,
            currentPedido.metodoPago,
            currentPedido.horario,
            currentPedido.total,
          ];
          const result = await client.query(query, values);
          const newPedido = result.rows[0];

          console.log("Pedido guardado en la base de datos");
          getIO().emit("nuevoPedido", newPedido);

          let mensajeConfirmacion = [
            "✅ *¡Pedido confirmado!* ✅",
            "",
            "Tu pedido ha sido registrado con éxito.",
            currentPedido.delivery
              ? `Te enviaremos tu pedido a la dirección: ${currentPedido.direccion}\n*Recuerda que el costo delivery varia entre 1500 a 5000 dependiendo de la distancia del viaje*`
              : "Puedes pasar a retirarlo por nuestro local.",
            "",
            "¡Gracias por tu compra! 😊",
            "Recuerda que tu pedido llegará entre 30 y 45 minutos",
          ];
          if (currentPedido.metodoPago?.toLowerCase() === "transferencia") {
            mensajeConfirmacion.push(
              "",
              "💳 *Recuerda:* Realiza la transferencia al alias *AGUSTINO.FSA*"
            );
          }
          await flowDynamic(mensajeConfirmacion.join("\n"));
        } catch (error) {
          console.error("Error al guardar el pedido:", error);
          await flowDynamic(
            "Hubo un error al guardar tu pedido. Por favor, inténtalo de nuevo."
          );
        } finally {
          await resetPedido(state); // Resetear estado con parámetro
          return;
        }
      } else if (respuesta.includes("2") || respuesta.includes("no")) {
        await resetPedido(state); // Resetear estado con parámetro
        return gotoFlow(require("./FlowPrincipal"));
      } else {
        return fallBack(
          "Por favor, indica si confirmas (1) o cancelas (2) el pedido"
        );
      }
    }
  );

module.exports = flowConfirmacionPedido;
