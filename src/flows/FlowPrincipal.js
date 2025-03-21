const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { resetPedido, pedidoActual } = require("../utils/resetPedido");
const flowMenuPizzeria = require("./FlowPizzeria");
const flowMenuPanaderia = require("./FlowPanaderia");
const flowMenuSandwiches = require("./FlowSandwiches");
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
  "Hola, buenas noches",
  "Hola, buenas tardes",
  "Hola, ¿cómo estás?",
  "Hola, ¿cómo está?",
  "ola",
  "holi",
  "holis",
  "jolis",
  "holas",
  "holus",
  "oa",
])
  .addAction(async (_, { flowDynamic }) => {
    resetPedido(); // Reiniciar el pedido al iniciar una nueva conversación
    await flowDynamic(
      "Hola, aprovechá un maravilloso descuento pidiendo por nuestra página! https://pedidos.masdelivery.com/muzza"
    );
  })
  .addAnswer("¿Qué deseas hacer hoy?")
  .addAnswer(
    [
      "1️⃣ Ver nuestro menú de *Pizzería* 🍕",
      "2️⃣ Ver nuestro menú de *Panadería* 🥐",
      "3️⃣ Ver nuestro menú de *Sándwiches* 🥪",
      "4️⃣ Realizar una *Consulta* 📝",
      "\nPuedes responder con el número o escribir lo que deseas.",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("pizz")) {
        pedidoActual.tipo = "Pizzería"; // Asignar el tipo de menú
        await flowDynamic("Has seleccionado la opción de Pizzería 🍕");
        return gotoFlow(flowMenuPizzeria);
      } else if (respuesta.includes("2") || respuesta.includes("pan")) {
        pedidoActual.tipo = "Panadería"; // Asignar el tipo de menú
        await flowDynamic("Has seleccionado la opción de Panadería 🥐");
        return gotoFlow(flowMenuPanaderia);
      } else if (respuesta.includes("3") || respuesta.includes("sandwich")) {
        pedidoActual.tipo = "Sándwiches"; // Asignar el tipo de menú
        await flowDynamic("Has seleccionado la opción de Sándwiches 🥪");
        return gotoFlow(flowMenuSandwiches);
      } else if (respuesta.includes("4") || respuesta.includes("consul")) {
        await flowDynamic("Vamos a resolver tu consulta 📝");
        return gotoFlow(flowConsultas);
      } else {
        return fallBack(
          "Por favor, selecciona una opción válida: 1 (Pizzería), 2 (Panadería), 3 (Sándwiches) o 4 (Consulta)"
        );
      }
    }
  );

module.exports = flowPrincipal;
