const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { resetPedido, getPedidoActual } = require("../utils/resetPedido");
const flowMenuPizzeria = require("./FlowPizzeria");
const flowMenuSandwiches = require("./FlowSandwiches");
const flowMenuEmpanadas = require("./flowMenuEmpanadas");
const flowGaseosas = require("./flowGaseosa");
const flowConsultas = require("./FlowConsultas");
const flowPanaderia = require("./FlowPanaderia");
const flowPastas = require("./flowPastas");

const flowPrincipal = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic, state }) => {
    await resetPedido(state);
    await flowDynamic(
      "Recuerda que recibes un descuento especial al realizar pedidos por nuestra página: 🌐\n" +
        "👉 https://pedidos.masdelivery.com/muzza 👈"
    );
  })
  .addAnswer("¿Qué deseas hacer hoy? 🤔")
  .addAnswer(
    [
      "1️⃣ Ver nuestro menú de *Pizzería* 🍕",
      "2️⃣ Ver nuestro menú de *Hamburguesas/Alitos* 🥪",
      "3️⃣ Ver nuestro menú de *Empanadas* 🥟",
      "4️⃣ Ver nuestro menú de *Bebidas* 🥤",
      "5️⃣ Ver nuestro menú de *Panadería* 🥐",
      "6️⃣ Ver nuestro menú de *Pastas* 🍝",
      "7️⃣ Hablar con un *empleado* 🧑‍💼",
      "\nResponde con el número o escribe lo que deseas. 😊",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
      const respuesta = ctx.body.toLowerCase();
      const currentPedido = await getPedidoActual(state);

      if (respuesta.includes("1") || respuesta.includes("pizz")) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Pizzería" },
        });
        await flowDynamic("🍕 *Has seleccionado la opción de Pizzería* 🍕");
        return gotoFlow(flowMenuPizzeria);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("Hamburguesa") ||
        respuesta.includes("hamb") ||
        respuesta.includes("alito") ||
        respuesta.includes("burguer")
      ) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Sándwiches" },
        });
        await flowDynamic("🥪 *Has seleccionado la opción de Sándwiches* 🥪");
        return gotoFlow(flowMenuSandwiches);
      } else if (respuesta.includes("3") || respuesta.includes("empa")) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Empanadas" },
        });
        await flowDynamic("🥟 *Has seleccionado la opción de Empanadas* 🥟");
        return gotoFlow(flowMenuEmpanadas);
      } else if (
        respuesta.includes("4") ||
        respuesta.includes("bebida") ||
        respuesta.includes("gaseosa") ||
        respuesta.includes("agua") ||
        respuesta.includes("cerveza")
      ) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Bebidas" },
        });
        await flowDynamic("🥤 *Has seleccionado el menú de Bebidas* 🥤");
        return gotoFlow(flowGaseosas);
      } else if (
        respuesta.includes("5") ||
        respuesta.includes("panaderia") ||
        respuesta.includes("pan")
      ) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Panadería" },
        });
        await flowDynamic("🥐 *Has seleccionado el menú de Panadería* 🥖");
        return gotoFlow(flowPanaderia);
      } else if (respuesta.includes("6") || respuesta.includes("pasta")) {
        await state.update({
          pedidoActual: { ...currentPedido, tipo: "Pastas" },
        });
        await flowDynamic("🍝 *Has seleccionado el menú de Pastas* 🧀");
        return gotoFlow(flowPastas);
      } else if (
        respuesta.includes("7") ||
        respuesta.includes("empleado") ||
        respuesta.includes("consulta") ||
        respuesta.includes("ayuda")
      ) {
        await flowDynamic("🧑‍💼 *Conectándote con un empleado...*");
        return gotoFlow(flowConsultas);
      } else {
        return fallBack(
          "❌ *Opción no válida.* Selecciona:\n\n" +
            "1️⃣ Pizzería 🍕\n" +
            "2️⃣ Hamburguesas/Alitos 🥪\n" +
            "3️⃣ Empanadas 🥟\n" +
            "4️⃣ Bebidas 🥤\n" +
            "5️⃣ Panadería 🥐\n" +
            "6️⃣ Pastas 🍝\n" +
            "7️⃣ Hablar con empleado 🧑‍💼"
        );
      }
    }
  );

module.exports = flowPrincipal;
