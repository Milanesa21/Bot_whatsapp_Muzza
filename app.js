// librerias para el bot
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
require("dotenv").config();
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/json");
const path = require("path");
const fs = require("fs");
const chat = require("./chatgpt");
const { handlerAI } = require("./whisper");

// Creación de carpeta temporal para archivos de voz si no existe
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

// Datos del pedido
let pedidoActual = {
  tipo: null, // "pizzeria" o "panaderia"
  items: [],
  delivery: null,
  detalles: null,
  nombreCliente: null,
  metodoPago: null,
  horario: null,
  total: 0,
};

// Reset pedido
const resetPedido = () => {
  pedidoActual = {
    tipo: null,
    items: [],
    delivery: null,
    detalles: null,
    nombreCliente: null,
    metodoPago: null,
    horario: null,
    total: 0,
  };
};

// Archivos para mensajes
const menuPizzeriaPath = path.join(__dirname, "mensajes", "menuPizzeria.txt");
const menuPizzeria = fs.readFileSync(menuPizzeriaPath, "utf-8");

const menuPanaderiaPath = path.join(__dirname, "mensajes", "menuPanaderia.txt");
const menuPanaderia = fs.readFileSync(menuPanaderiaPath, "utf-8");

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.txt");
const promptConsultas = fs.readFileSync(pathConsultas, "utf-8");

// Flow para convertir notas de voz en texto y procesarlas
const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, ctxFn) => {
    try {
      // Convertir nota de voz a texto
      const texto = await handlerAI(ctx);
      console.log("Texto convertido de voz:", texto);

      // Analizar el mensaje para determinar la intención
      let intencion = await detectarIntencion(texto);

      // Dirigir al usuario según su intención
      await procesarIntencion(intencion, texto, ctxFn);
    } catch (error) {
      console.error("Error en procesamiento de voz:", error);
      await ctxFn.flowDynamic(
        "Lo siento, no pude procesar tu mensaje de voz. ¿Podrías intentar de nuevo o enviarlo por texto?"
      );
    }
  }
);

// Función para detectar la intención del usuario desde texto
const detectarIntencion = async (texto) => {
  const textoLower = texto.toLowerCase();

  // Palabras clave para cada categoría
  const palabrasPizzeria = [
    "pizza",
    "pizzas",
    "pizzería",
    "pizzeria",
    "muzzarella",
    "calabresa",
  ];
  const palabrasPanaderia = [
    "pan",
    "panadería",
    "panaderia",
    "facturas",
    "medialunas",
    "torta",
  ];
  const palabrasConsulta = [
    "consulta",
    "pregunta",
    "información",
    "informacion",
    "duda",
    "ayuda",
  ];

  // Verificar coincidencias
  if (palabrasPizzeria.some((palabra) => textoLower.includes(palabra))) {
    return "pizzeria";
  } else if (
    palabrasPanaderia.some((palabra) => textoLower.includes(palabra))
  ) {
    return "panaderia";
  } else if (palabrasConsulta.some((palabra) => textoLower.includes(palabra))) {
    return "consulta";
  }

  // Si no hay coincidencia clara, usar IA para interpretar
  const prompt =
    "Determina si este mensaje se refiere a una pizzería, panadería o es una consulta general. Responde solo con una palabra: 'pizzeria', 'panaderia' o 'consulta'.";
  const respuesta = await chat(prompt, texto);
  return respuesta.toLowerCase();
};

// Procesar la intención detectada
const procesarIntencion = async (intencion, texto, ctxFn) => {
  switch (intencion) {
    case "pizzeria":
      pedidoActual.tipo = "pizzeria";
      await ctxFn.flowDynamic("Has seleccionado la opción de Pizzería 🍕");
      return ctxFn.gotoFlow(flowMenuPizzeria);
    case "panaderia":
      pedidoActual.tipo = "panaderia";
      await ctxFn.flowDynamic("Has seleccionado la opción de Panadería 🥐");
      return ctxFn.gotoFlow(flowMenuPanaderia);
    case "consulta":
      await ctxFn.flowDynamic("Vamos a resolver tu consulta 📝");
      return ctxFn.gotoFlow(flowConsultas);
    default:
      await ctxFn.flowDynamic(
        "No he podido entender tu solicitud. ¿Podrías elegir una opción: pizzería 🍕, panadería 🥐 o consulta 📝?"
      );
  }
};

// Flow principal de bienvenida
const flowPrincipal = addKeyword([
  "Hola",
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
  "holas",
  "holas",
  "holus",
  "oa",
])
  .addAction(async (_, { flowDynamic }) => {
    // Reset el pedido al inicio
    resetPedido();
    await flowDynamic(
      "🙌 ¡Hola! Bienvenido a Muzza, tu lugar de pizzería y panadería 🍕🥐"
    );
  })
  .addAnswer("¿Qué deseas hacer hoy?")
  .addAnswer(
    [
      "1️⃣ Ver nuestro menú de *Pizzería* 🍕",
      "2️⃣ Ver nuestro menú de *Panadería* 🥐",
      "3️⃣ Realizar una *Consulta* 📝",
      "\nPuedes responder con el número o escribir lo que deseas.",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (respuesta.includes("1") || respuesta.includes("pizz")) {
        pedidoActual.tipo = "pizzeria";
        await flowDynamic("Has seleccionado la opción de Pizzería 🍕");
        return gotoFlow(flowMenuPizzeria);
      } else if (respuesta.includes("2") || respuesta.includes("pan")) {
        pedidoActual.tipo = "panaderia";
        await flowDynamic("Has seleccionado la opción de Panadería 🥐");
        return gotoFlow(flowMenuPanaderia);
      } else if (respuesta.includes("3") || respuesta.includes("consul")) {
        await flowDynamic("Vamos a resolver tu consulta 📝");
        return gotoFlow(flowConsultas);
      } else {
        return fallBack(
          "Por favor, selecciona una opción válida: 1 (Pizzería), 2 (Panadería) o 3 (Consulta)"
        );
      }
    }
  );

// Flow para el menú de Pizzería
const flowMenuPizzeria = addKeyword(EVENTS.ACTION)
  .addAnswer("🍕 *MENÚ DE PIZZERÍA* 🍕")
  .addAnswer(
    menuPizzeria,
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const seleccion = ctx.body;
      if (
        !isNaN(seleccion) &&
        parseInt(seleccion) >= 1 &&
        parseInt(seleccion) <= 5
      ) {
        const opcion = parseInt(seleccion);
        let item = {
          nombre: "",
          precio: 0,
        };

        switch (opcion) {
          case 1:
            item.nombre = "Pizza Muzzarella";
            item.precio = 2500;
            break;
          case 2:
            item.nombre = "Pizza Calabresa";
            item.precio = 3000;
            break;
          case 3:
            item.nombre = "Pizza Especial";
            item.precio = 3200;
            break;
          case 4:
            item.nombre = "Pizza Napolitana";
            item.precio = 2800;
            break;
          case 5:
            item.nombre = "Pizza Fugazzeta";
            item.precio = 2900;
            break;
        }

        pedidoActual.items.push(item);
        pedidoActual.total += item.precio;

        await flowDynamic(
          `Has agregado ${item.nombre} ($${item.precio}) a tu pedido. Total actual: $${pedidoActual.total}`
        );
        return gotoFlow(flowAgregarMas);
      } else {
        return fallBack("Por favor, selecciona una opción válida (1-5)");
      }
    }
  );

// Flow para el menú de Panadería
const flowMenuPanaderia = addKeyword(EVENTS.ACTION)
  .addAnswer("🥐 *MENÚ DE PANADERÍA* 🥐")
  .addAnswer(
    menuPanaderia,
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const seleccion = ctx.body;
      if (
        !isNaN(seleccion) &&
        parseInt(seleccion) >= 1 &&
        parseInt(seleccion) <= 5
      ) {
        const opcion = parseInt(seleccion);
        let item = {
          nombre: "",
          precio: 0,
        };

        switch (opcion) {
          case 1:
            item.nombre = "Pan Francés (kg)";
            item.precio = 800;
            break;
          case 2:
            item.nombre = "Medialunas (docena)";
            item.precio = 1200;
            break;
          case 3:
            item.nombre = "Facturas (docena)";
            item.precio = 1400;
            break;
          case 4:
            item.nombre = "Torta (porción)";
            item.precio = 600;
            break;
          case 5:
            item.nombre = "Sandwich de miga (unidad)";
            item.precio = 400;
            break;
        }

        pedidoActual.items.push(item);
        pedidoActual.total += item.precio;

        await flowDynamic(
          `Has agregado ${item.nombre} ($${item.precio}) a tu pedido. Total actual: $${pedidoActual.total}`
        );
        return gotoFlow(flowAgregarMas);
      } else {
        return fallBack("Por favor, selecciona una opción válida (1-5)");
      }
    }
  );

// Flow para preguntar si desea agregar más items
const flowAgregarMas = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Deseas agregar algo más a tu pedido?")
  .addAnswer(
    ["1️⃣ Sí, agregar más productos", "2️⃣ No, continuar con el pedido"].join(
      "\n"
    ),
    { capture: true },
    async (ctx, { gotoFlow, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (
        respuesta.includes("1") ||
        respuesta.includes("si") ||
        respuesta.includes("sí")
      ) {
        // Verificar si el último pedido fue de pizzería o panadería
        if (pedidoActual.tipo === "pizzeria") {
          return gotoFlow(flowMenuPizzeria);
        } else {
          return gotoFlow(flowMenuPanaderia);
        }
      } else if (respuesta.includes("2") || respuesta.includes("no")) {
        return gotoFlow(flowDelivery);
      } else {
        return fallBack(
          "Por favor, indica si deseas agregar más productos (1) o continuar con el pedido (2)"
        );
      }
    }
  );

// Flow para preguntar sobre delivery
const flowDelivery = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Cómo deseas recibir tu pedido?")
  .addAnswer(
    [
      "1️⃣ Delivery a domicilio (+$500)",
      "2️⃣ Paso a retirarlo personalmente",
    ].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (
        respuesta.includes("1") ||
        respuesta.includes("delivery") ||
        respuesta.includes("domicilio")
      ) {
        pedidoActual.delivery = true;
        pedidoActual.total += 500; // Cargo extra por delivery
        await flowDynamic(
          "Has seleccionado delivery a domicilio. Se ha agregado un cargo de $500. Total actualizado: $" +
            pedidoActual.total
        );
        return gotoFlow(flowDetallesPedido);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("retir") ||
        respuesta.includes("paso")
      ) {
        pedidoActual.delivery = false;
        await flowDynamic(
          "Has seleccionado retirar personalmente. Total del pedido: $" +
            pedidoActual.total
        );
        return gotoFlow(flowDetallesPedido);
      } else {
        return fallBack(
          "Por favor, indica si deseas delivery (1) o retirarlo personalmente (2)"
        );
      }
    }
  );

// Flow para detalles del pedido
const flowDetallesPedido = addKeyword(EVENTS.ACTION).addAnswer(
  "¿Deseas agregar algún detalle específico en tu pedido? (por ejemplo, sin cebolla, bien cocido, etc.)",
  { capture: true },
  async (ctx, { gotoFlow }) => {
    pedidoActual.detalles = ctx.body;
    return gotoFlow(flowNombreCliente);
  }
);

// Flow para nombre del cliente
const flowNombreCliente = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, indica a nombre de quién estará el pedido",
  { capture: true },
  async (ctx, { gotoFlow }) => {
    pedidoActual.nombreCliente = ctx.body;
    return gotoFlow(flowMetodoPago);
  }
);

// Flow para método de pago
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

// Flow para horario de entrega
const flowHorario = addKeyword(EVENTS.ACTION)
  .addAnswer("¿Para qué horario deseas tu pedido?")
  .addAnswer(
    ["1️⃣ Lo antes posible", "2️⃣ Para un horario específico"].join("\n"),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
      const respuesta = ctx.body.toLowerCase();

      if (
        respuesta.includes("1") ||
        respuesta.includes("antes") ||
        respuesta.includes("posible")
      ) {
        pedidoActual.horario = "Lo antes posible";
        return gotoFlow(flowConfirmacionPedido);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("especifico") ||
        respuesta.includes("específico")
      ) {
        await flowDynamic(
          "¿Para qué horario específico lo deseas? (Ej: 20:30)"
        );
        return fallBack();
      } else if (respuesta.includes(":") || /\d+[:]\d+/.test(respuesta)) {
        // Si el usuario ingresó directamente un horario en formato HH:MM
        pedidoActual.horario = respuesta;
        return gotoFlow(flowConfirmacionPedido);
      } else {
        return fallBack(
          "Por favor, indica si lo deseas lo antes posible (1) o especifica un horario"
        );
      }
    }
  );

// Flow de confirmación final del pedido
const flowConfirmacionPedido = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    // Crear resumen del pedido
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
        pedidoActual.delivery ? "Delivery (+$500)" : "Retiro en local"
      }`,
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

      if (
        respuesta.includes("1") ||
        respuesta.includes("si") ||
        respuesta.includes("sí") ||
        respuesta.includes("conf")
      ) {
        await flowDynamic(
          [
            "✅ *¡Pedido confirmado!* ✅",
            "",
            "Tu pedido ha sido registrado con éxito.",
            pedidoActual.delivery
              ? "Te enviaremos tu pedido a la dirección proporcionada."
              : "Puedes pasar a retirarlo por nuestro local.",
            "",
            "¡Gracias por tu compra! 😊",
          ].join("\n")
        );
        resetPedido();
        return gotoFlow(flowPrincipal);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("no") ||
        respuesta.includes("cancel")
      ) {
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

// Flow de consultas
const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer("📝 *Consultas* 📝")
  .addAnswer(
    "¿En qué podemos ayudarte?",
    { capture: true },
    async (ctx, ctxFn) => {
      const prompt = promptConsultas;
      const consulta = ctx.body;
      const answer = await chat(prompt, consulta);
      await ctxFn.flowDynamic(answer);

      // Preguntar si desea hacer un pedido después de la consulta
      await ctxFn.flowDynamic(
        [
          "¿Deseas realizar un pedido ahora?",
          "",
          "1️⃣ Sí, quiero hacer un pedido",
          "2️⃣ No, gracias",
        ].join("\n")
      );

      return ctxFn.fallBack();
    }
  )
  .addAction({ capture: true }, async (ctx, { gotoFlow, fallBack }) => {
    const respuesta = ctx.body.toLowerCase();

    if (
      respuesta.includes("1") ||
      respuesta.includes("si") ||
      respuesta.includes("sí")
    ) {
      return gotoFlow(flowPrincipal);
    } else if (respuesta.includes("2") || respuesta.includes("no")) {
      return fallBack("Entendido. Si necesitas algo más, estamos para ayudarte. ¡Gracias por contactarnos!");
    } else {
      return fallBack(
        "Por favor, indica si deseas hacer un pedido (1) o no (2)"
      );
    }
  });

// En caso que no se reconozca la palabra
const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  "Lo siento, pero no reconozco esa palabra. ¿Necesitas ayuda con pizzería 🍕, panadería 🥐, o tienes alguna consulta 📝?"
);

// Inicialización del bot
const main = async () => {
  try {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
      flowPrincipal,
      flowWelcome,
      flowMenuPizzeria,
      flowMenuPanaderia,
      flowAgregarMas,
      flowDelivery,
      flowDetallesPedido,
      flowNombreCliente,
      flowMetodoPago,
      flowHorario,
      flowConfirmacionPedido,
      flowConsultas,
      flowVoice,
    ]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    QRPortalWeb();
  } catch (error) {
    console.error("Error en main:", error);
  }
};

main();