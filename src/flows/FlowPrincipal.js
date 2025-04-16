const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { resetPedido, pedidoActual } = require("../utils/resetPedido");
const flowMenuPizzeria = require("./FlowPizzeria");
const flowMenuSandwiches = require("./FlowSandwiches");
const flowMenuEmpanadas = require("./flowMenuEmpanadas");
const flowGaseosas = require("./flowGaseosa");
const flowConsultas = require("./FlowConsultas"); 

const flowPrincipal = addKeyword([
  "Hola",
  "jola",
  "alo",
  "ole",
  "Buenos días",
  "Buenas tardes",
  "Buenas noches",
  "Saludos",
  "Hola, buenas",
  "Hola, buenos días",
  "Hola, buenas tardes",
  "Hola, buenas noches",
  "Hola, ¿cómo están?",
  "Buen día",
  "Hola, buen día",
  "Hola, ¿cómo estás?",
  "Hola, ¿cómo está?",
  "ola",
  "holi",
  "holis",
  "jolis",
  "holas",
  "holus",
  "oa",
  "oal",
])
  .addAction(async (_, { flowDynamic }) => {
    resetPedido();
    await flowDynamic(
      "¡Hola! 👋 Bienvenido a *Muzza*. 🧀🍕\n\n" +
        "Recuerda que recibes un descuento especial al realizar pedidos por nuestra página: 🌐\n" +
        "👉 https://pedidos.masdelivery.com/muzza 👈"
    );
  })
  .addAnswer("¿Qué deseas hacer hoy? 🤔")
  .addAnswer(
    [
      "1️⃣ Ver nuestro menú de *Pizzería* 🍕",
      "2️⃣ Ver nuestro menú de *Sándwiches* 🥪",
      "3️⃣ Ver nuestro menú de *Empanadas* 🥟",
      "4️⃣ Ver nuestro menú de *Gaseosas, Aguas Saborizadas y Bebidas* 🥤",
      "5️⃣ Hablar con un *empleado* para consultas 🧑‍💼",
      "\nPuedes responder con el número o escribir lo que deseas. 😊",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("pizz")) {
        pedidoActual.tipo = "Pizzería";
        await flowDynamic("🍕 *Has seleccionado la opción de Pizzería* 🍕");
        return gotoFlow(flowMenuPizzeria);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("sandwich") ||
        respuesta.includes("sanguich") ||
        respuesta.includes("sangui")
      ) {
        pedidoActual.tipo = "Sándwiches";
        await flowDynamic("🥪 *Has seleccionado la opción de Sándwiches* 🥪");
        return gotoFlow(flowMenuSandwiches);
      } else if (respuesta.includes("3") || respuesta.includes("empa")) {
        pedidoActual.tipo = "Empanadas";
        await flowDynamic("🥟 *Has seleccionado la opción de Empanadas* 🥟");
        return gotoFlow(flowMenuEmpanadas);
      } else if (
        respuesta.includes("4") ||
        respuesta.includes("gas") ||
        respuesta.includes("gaseosa") ||
        respuesta.includes("agua") ||
        respuesta.includes("bebida") ||
        respuesta.includes("cerveza") ||
        respuesta.includes("tomar")
      ) {
        pedidoActual.tipo = "Gaseosas";
        await flowDynamic(
          "🥤 *Has seleccionado la opción de Gaseosas, Aguas Saborizadas y Bebidas* 🥤"
        );
        return gotoFlow(flowGaseosas);
      } else if (
        respuesta.includes("5") ||
        respuesta.includes("consulta") ||
        respuesta.includes("empleado") ||
        respuesta.includes("duda") ||
        respuesta.includes("pregunta") ||
        respuesta.includes("ayuda")
      ) {
        await flowDynamic("🧑‍💼 *Has solicitado hablar con un empleado.*");
        return gotoFlow(flowConsultas);
      } else {
        return fallBack(
          "❌ *Opción no válida.* Por favor, selecciona una de las siguientes opciones:\n\n" +
            "1️⃣ Pizzería 🍕\n" +
            "2️⃣ Sándwiches 🥪\n" +
            "3️⃣ Empanadas 🥟\n" +
            "4️⃣ Gaseosas y Bebidas 🥤\n" +
            "5️⃣ Hablar con un empleado 🧑‍💼"
        );
      }
    }
  );

module.exports = flowPrincipal;
