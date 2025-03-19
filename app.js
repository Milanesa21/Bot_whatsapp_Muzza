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
const { client } = require("./db");
const { inicializarBaseDeDatos } = require("./db");
const express = require("express");
const app = express(); // Crear una instancia de Express


// En tu backend (app.js o un archivo de rutas)
app.get("/pedidos", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM pedidos");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).send("Error al obtener pedidos");
  }
});

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
      "Hola, aprovechá un maravilloso descuento pidiendo por nuestra página! https://pedidos.masdelivery.com/muzza "
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
        pedidoActual.tipo = "pizzeria";
        await flowDynamic("Has seleccionado la opción de Pizzería 🍕");
        return gotoFlow(flowMenuPizzeria);
      } else if (respuesta.includes("2") || respuesta.includes("pan")) {
        pedidoActual.tipo = "panaderia";
        await flowDynamic("Has seleccionado la opción de Panadería 🥐");
        return gotoFlow(flowMenuPanaderia);
      } else if (respuesta.includes("3") || respuesta.includes("sandwich")) {
        pedidoActual.tipo = "sandwiches";
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

// Flow para el menú de Pizzería
const flowMenuPizzeria = addKeyword(EVENTS.ACTION)
  .addAnswer("🍕 *MENÚ DE PIZZERÍA* 🍕")
  .addAnswer(
    "Las pizzas son 100% artesanales. Elige una opción:\n\n" +
      "1. Muzzarella (Chica: $14.000 - Grande: $16.000)\n" +
      "2. Doble Muzzarella (Chica: $17.000 - Grande: $19.000)\n" +
      "3. Rúcula (Chica: $17.000 - Grande: $19.000)\n" +
      "4. Rúcula y Jamón Crudo (Chica: $19.000 - Grande: $21.000)\n" +
      "5. Jamón Crudo (Chica: $18.000 - Grande: $20.000)\n" +
      "6. Especial (Chica: $16.000 - Grande: $18.000)\n" +
      "7. Completa (Chica: $17.000 - Grande: $19.000)\n" +
      "8. Capresse (Chica: $15.000 - Grande: $17.000)\n" +
      "9. Pepperoni (Chica: $16.000 - Grande: $18.000)\n" +
      "10. Muzza Picante (Chica: $14.000 - Grande: $16.000)\n" +
      "11. Otras Variedades (Consultar precios)",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
      const seleccion = ctx.body;
      if (!isNaN(seleccion)) {
        const opcion = parseInt(seleccion);
        let item = {
          nombre: "",
          precioChica: 0,
          precioGrande: 0,
        };

        switch (opcion) {
          case 1:
            item.nombre = "Muzzarella";
            item.precioChica = 14000;
            item.precioGrande = 16000;
            break;
          case 2:
            item.nombre = "Doble Muzzarella";
            item.precioChica = 17000;
            item.precioGrande = 19000;
            break;
          case 3:
            item.nombre = "Rúcula";
            item.precioChica = 17000;
            item.precioGrande = 19000;
            break;
          case 4:
            item.nombre = "Rúcula y Jamón Crudo";
            item.precioChica = 19000;
            item.precioGrande = 21000;
            break;
          case 5:
            item.nombre = "Jamón Crudo";
            item.precioChica = 18000;
            item.precioGrande = 20000;
            break;
          case 6:
            item.nombre = "Especial";
            item.precioChica = 16000;
            item.precioGrande = 18000;
            break;
          case 7:
            item.nombre = "Completa";
            item.precioChica = 17000;
            item.precioGrande = 19000;
            break;
          case 8:
            item.nombre = "Capresse";
            item.precioChica = 15000;
            item.precioGrande = 17000;
            break;
          case 9:
            item.nombre = "Pepperoni";
            item.precioChica = 16000;
            item.precioGrande = 18000;
            break;
          case 10:
            item.nombre = "Muzza Picante";
            item.precioChica = 14000;
            item.precioGrande = 16000;
            break;
          case 11:
            await flowDynamic(
              "Otras variedades disponibles:\n" +
                "Jamón, Morrones y Huevo: $19.000 - $21.000\n" +
                "Jamón, Morrones y Palmitos: $22.000 - $24.000\n" +
                "Champignon: $18.000 - $20.000\n" +
                "Tomate, Calabresa y Salsa Picante: $16.000 - $18.000\n" +
                "Tomate, Jamón y Huevo: $18.000 - $20.000\n" +
                "Anchoas: $18.000 - $20.000\n" +
                "Palmitos: $18.000 - $20.000\n" +
                "Cuatro Quesos: $22.000 - $24.000\n" +
                "Muzza: $22.000 - $24.000\n" +
                "Napolitana y Jamón: $17.000 - $19.000\n" +
                "Fugazzeta: $16.000 - $18.000\n" +
                "Fugazzeta y Jamón: $18.000 - $20.000\n" +
                "Muzza Especial: $20.000 - $22.000\n" +
                "Calabresa: $17.000 - $19.000\n" +
                "Roquefort: $18.000 - $20.000\n" +
                "Ciruela a la Tocineta: $20.000 - $22.000\n" +
                "Pollo a la Barbacoa: $18.000 - $20.000"
            );
            return fallBack(); // Volver al menú anterior
          default:
            return fallBack("Por favor, selecciona una opción válida (1-11)");
        }

        // Guardar el item en el pedido actual
        pedidoActual.items.push(item);

        // Preguntar por el tamaño
        await flowDynamic(
          `Has seleccionado ${item.nombre}. ¿Qué tamaño deseas?\n\n` +
            "1. Chica\n" +
            "2. Grande"
        );

        // Capturar la selección del tamaño
        return gotoFlow(flowSeleccionTamaño); // Redirigir al flujo de selección de tamaño
      } else {
        return fallBack("Por favor, selecciona una opción válida (1-11)");
      }
    }
  );

// Flujo para seleccionar el tamaño de la pizza
const flowSeleccionTamaño = addKeyword(EVENTS.ACTION).addAction(
  { capture: true },
  async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
    const seleccionTamaño = ctx.body.toLowerCase();
    const item = pedidoActual.items[pedidoActual.items.length - 1]; // Obtener el último item agregado

    if (seleccionTamaño.includes("1") || seleccionTamaño.includes("chica")) {
      item.precio = item.precioChica;
      item.tamaño = "Chica";
    } else if (
      seleccionTamaño.includes("2") ||
      seleccionTamaño.includes("grande")
    ) {
      item.precio = item.precioGrande;
      item.tamaño = "Grande";
    } else {
      return fallBack(
        "Por favor, selecciona un tamaño válido: 1 (Chica) o 2 (Grande)"
      );
    }

    // Actualizar el total del pedido
    pedidoActual.total += item.precio;

    await flowDynamic(
      `Has agregado ${item.nombre} (${item.tamaño}) - $${item.precio} a tu pedido. Total actual: $${pedidoActual.total}`
    );

    // Redirigir al flujo para agregar más productos
    return gotoFlow(flowAgregarMas);
  }
);

// Flow para el menú de Panadería
const flowMenuPanaderia = addKeyword(EVENTS.ACTION)
  .addAnswer("🥐 *MENÚ DE PANADERÍA* 🥐")
  .addAnswer(
    "Elige una opción:\n\n" +
      "1. Facturas\n" +
      "2. Grisines\n" +
      "3. Sándwich de miga\n" +
      "4. Otros productos",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
      const seleccion = ctx.body;
      if (!isNaN(seleccion)) {
        const opcion = parseInt(seleccion);
        let item = {
          nombre: "",
          precio: 0,
        };

        switch (opcion) {
          case 1:
            item.nombre = "Facturas";
            item.precio = 8000; // Precio de ejemplo
            break;
          case 2:
            item.nombre = "Grisines";
            item.precio = 6000; // Precio de ejemplo
            break;
          case 3:
            item.nombre = "Sándwich de miga";
            item.precio = 7000; // Precio de ejemplo
            break;
          case 4:
            await flowDynamic(
              "Otros productos disponibles:\n" +
                "Medialunas, Pan de leche, Bollos, Tortitas negras, Chipitas, etc."
            );
            return fallBack();
          default:
            return fallBack("Por favor, selecciona una opción válida (1-4)");
        }

        pedidoActual.items.push(item);
        pedidoActual.total += item.precio;

        await flowDynamic(
          `Has agregado ${item.nombre} - $${item.precio} a tu pedido. Total actual: $${pedidoActual.total}`
        );
        return gotoFlow(flowAgregarMas);
      } else {
        return fallBack("Por favor, selecciona una opción válida (1-4)");
      }
    }
  );


  const flowMenuSandwiches = addKeyword(EVENTS.ACTION)
    .addAnswer("🥪 *MENÚ DE SÁNDWICHES* 🥪")
    .addAnswer(
      "Elige un sándwich:\n\n" +
        "1. Hamburguesa Especial ($9.000)\n" +
        "2. Hamburguesa Completa ($9.500)\n" +
        "3. Sándwich de Pollo Especial ($9.500)\n" +
        "4. Sándwich de Pollo Completo ($10.000)\n" +
        "5. Alito de Carne Especial (Precio no indicado)\n" +
        "6. Alito de Carne Completo (Precio no indicado)\n" +
        "7. Alito de Pollo Especial ($14.000)\n" +
        "8. Alito de Pollo Completo ($15.000)\n" +
        "9. Tostado de Jamón y Queso ($6.000)",
      { capture: true },
      async (ctx, { flowDynamic, fallBack, gotoFlow }) => {
        const seleccion = ctx.body;
        if (!isNaN(seleccion)) {
          const opcion = parseInt(seleccion);
          let item = {
            nombre: "",
            precio: 0,
          };

          switch (opcion) {
            case 1:
              item.nombre = "Hamburguesa Especial";
              item.precio = 9000;
              break;
            case 2:
              item.nombre = "Hamburguesa Completa";
              item.precio = 9500;
              break;
            case 3:
              item.nombre = "Sándwich de Pollo Especial";
              item.precio = 9500;
              break;
            case 4:
              item.nombre = "Sándwich de Pollo Completo";
              item.precio = 10000;
              break;
            case 5:
              item.nombre = "Alito de Carne Especial";
              item.precio = 12000; // Precio estimado
              break;
            case 6:
              item.nombre = "Alito de Carne Completo";
              item.precio = 13000; // Precio estimado
              break;
            case 7:
              item.nombre = "Alito de Pollo Especial";
              item.precio = 14000;
              break;
            case 8:
              item.nombre = "Alito de Pollo Completo";
              item.precio = 15000;
              break;
            case 9:
              item.nombre = "Tostado de Jamón y Queso";
              item.precio = 6000;
              break;
            default:
              return fallBack("Por favor, selecciona una opción válida (1-9)");
          }

          pedidoActual.items.push(item);
          pedidoActual.total += item.precio;

          await flowDynamic(
            `Has agregado ${item.nombre} - $${item.precio} a tu pedido. Total actual: $${pedidoActual.total}`
          );
          return gotoFlow(flowAgregarMas);
        } else {
          return fallBack("Por favor, selecciona una opción válida (1-9)");
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
        // Verificar si el último pedido fue de pizzería, panadería o sándwiches
        if (pedidoActual.tipo === "pizzeria") {
          return gotoFlow(flowMenuPizzeria);
        } else if (pedidoActual.tipo === "panaderia") {
          return gotoFlow(flowMenuPanaderia);
        } else if (pedidoActual.tipo === "sandwiches") {
          return gotoFlow(flowMenuSandwiches);
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

  // Flow para preguntar la dirección en caso de delivery
const flowDireccion = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor, indica la dirección a la que deseas recibir tu pedido:",
  { capture: true },
  async (ctx, { gotoFlow }) => {
    pedidoActual.direccion = ctx.body; // Guardar la dirección
    return gotoFlow(flowDetallesPedido); // Continuar con el flujo de detalles
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
    async (ctx, { gotoFlow, flowDynamic }) => {
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
        // Redirigir a un flujo específico para capturar el horario
        return gotoFlow(flowHorarioEspecifico);
      } else {
        // Si el formato no es válido
        await flowDynamic(
          "Por favor, selecciona una opción válida: 1 (Lo antes posible) o 2 (Para un horario específico)"
        );
        return fallBack();
      }
    }
  );

// Nuevo flow para capturar un horario específico
const flowHorarioEspecifico = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "¿Para qué horario específico lo deseas? (Ej: 20:30)",
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      // Capturar el horario ingresado
      const horarioIngresado = ctx.body;
      
      // Validar formato de horario (simple)
      if (/\d+[:]\d+/.test(horarioIngresado) || horarioIngresado.includes(":")) {
        pedidoActual.horario = horarioIngresado;
        await flowDynamic(`Perfecto, tu pedido será para las ${horarioIngresado}`);
        return gotoFlow(flowConfirmacionPedido);
      } else {
        await flowDynamic("Por favor, ingresa un horario válido (Ej: 20:30)");
        return fallBack();
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
      pedidoActual.delivery
        ? `📍 *Dirección:* ${pedidoActual.direccion}`
        : "",
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
        // Guardar el pedido en la base de datos
        try {
          const query = `
            INSERT INTO pedidos (tipo, items, delivery, direccion, detalles, nombre_cliente, metodo_pago, horario, total)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `;
          const values = [
            pedidoActual.tipo,
            JSON.stringify(pedidoActual.items), // Convertir items a JSON
            pedidoActual.delivery,
            pedidoActual.direccion || null, // Guardar la dirección (o null si no hay)
            pedidoActual.detalles,
            pedidoActual.nombreCliente,
            pedidoActual.metodoPago,
            pedidoActual.horario,
            pedidoActual.total,
          ];

          await client.query(query, values); // Ejecutar la consulta
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
          resetPedido(); // Reiniciar el pedido
          return; // Detener la conversación hasta que el usuario envíe un nuevo mensaje
        }
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
          "2️⃣ No, quiero hacer otra consulta",
        ].join("\n")
      );

      return ctxFn.fallBack();
    }
  )
  .addAction(
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      const respuesta = ctx.body.toLowerCase();

      if (
        respuesta.includes("1") ||
        respuesta.includes("si") ||
        respuesta.includes("sí") ||
        respuesta.includes("pedido")
      ) {
        // Si elige hacer un pedido, lo redirigimos al flujo principal
        await flowDynamic("Perfecto, vamos a iniciar un nuevo pedido. 🍕🥐🥪");
        return gotoFlow(flowPrincipal);
      } else if (
        respuesta.includes("2") ||
        respuesta.includes("no") ||
        respuesta.includes("otra consulta")
      ) {
        // Si elige hacer otra consulta, se queda en el flujo de consultas
        await flowDynamic("Claro, ¿en qué más podemos ayudarte? 📝");
        return fallBack(); // Vuelve a preguntar por una nueva consulta
      } else {
        // Si la opción no es válida, se aclaran las opciones disponibles
        await flowDynamic(
          [
            "Por favor, selecciona una opción válida:",
            "",
            "1️⃣ Sí, quiero hacer un pedido",
            "2️⃣ No, quiero hacer otra consulta",
          ].join("\n")
        );
        return fallBack(); // Vuelve a preguntar por la opción
      }
    }
  );

// En caso que no se reconozca la palabra
const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  "Lo siento, pero no reconozco esa palabra. Si deseas hacer un pedido o hacer una consulta, escribenos hola y empezaremos con tu pedido"
);


// Inicializar la base de datos antes de iniciar el bot
inicializarBaseDeDatos()
  .then(() => {
    console.log("Base de datos inicializada correctamente.");
    main();
  })
  .catch((error) => {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1); // Salir del proceso si hay un error crítico
  });

// Inicialización del bot
const main = async () => {
  try {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([
      flowPrincipal,
      flowWelcome,
      flowMenuPizzeria,
      flowMenuPanaderia,
      flowMenuSandwiches,
      flowSeleccionTamaño,
      flowAgregarMas,
      flowDelivery,
      flowDetallesPedido,
      flowNombreCliente,
      flowMetodoPago,
      flowHorario,
      flowHorarioEspecifico,
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

     app.listen(4000, () => {
       console.log("Servidor backend corriendo en http://localhost:4000");
     });

    // Iniciar el servidor una sola vez
    QRPortalWeb({ port: 5000 }); // Cambia el puerto a 5000 o cualquier otro disponible
    console.log("Servidor iniciado en http://localhost:5000");
  } catch (error) {
    console.error("Error en main:", error);
  }
};
