// librerias para el bot
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
require('dotenv').config();
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/json');
const path = require('path');
const fs = require('fs');
const chat = require('./chatgpt');
const { handlerAI } = require('./whisper'); 

// archivos para el voz a texto
const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAction(
async (ctx, ctxFn) => {
const text = await handlerAI(ctx);
 const prompt = pathConsultas;
 const consulta = ctx.body;
 const answer = await chat(prompt, consulta);
 await ctxFn.flowDynamic(answer.content);

}
)

// archivos para el menu
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");


// archivos para las consultas
const pathConsultas= path.join(__dirname, "mensajes", "promptConsultas.txt");
const promptConsultas = fs.readFileSync(pathConsultas, "utf-8");


// archivos para el chat de saludo
const flowPrincipal = addKeyword(["Hola", "alo", "ole", "Buenos días", "Buenas tardes", "Buenas noches", "Saludos", "Hola, buenas", "Hola, buenos días", "Hola, buenas tardes", "Hola, buenas noches", "Hola, ¿cómo están?", "Buen día", "Hola, buen día", "Hola, buenas noches", "Hola, buenas tardes", "Hola, ¿cómo estás?", "Hola, ¿cómo está?", "ola", "holi", "holis", "holas", "holas", "holus", "oa"])
    .addAnswer('🙌 Hola bienvenido *Muzza*, si quieres acceder a nuestra selección de comidas, por favor, escribe la palabra *menu* 🤗🍴');


// archivos para el menu de comidas
const flowMenuRest = addKeyword([EVENTS.ACTION])
    .addAnswer('Este es nuestro menú de comidas 🍴🤗', {
        media: "https://img.freepik.com/vector-gratis/menu-restaurante-moderno-comida-rapida_52683-48982.jpg?semt=ais_hybrid"
    });


// archivos para las reservas
const flowReservas = addKeyword([EVENTS.ACTION])
    .addAnswer('📅 *Reservas* 📅')
    .addAnswer('www.reservasfalsas.com');


// archivos para las consultas
const flowConsultas = addKeyword([EVENTS.ACTION])
    .addAnswer('📞 *Consultas* 📞')
    .addAnswer("¿En qué podemos ayudarte?", {capture: true}, async(ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.body 
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)

    })
    
// En caso que no se reconozca la palabra
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("Lo sentimos, pero no reconocemos esa palabra. Si quieres ver nuestra selección de comidas, por favor, escribe la palabra *menu*.");


// menu de opciones
const menuFlow = addKeyword(["menu", "Menu", "MENU", "menú", "MENÚ", "ménu", "MÉNU", "ménú", "MÉNÚ", "que opcion de comidas tiene", "que tienen para comer", "🤗🍴"])
    .addAnswer(menu, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        try {
            if (!["1", "2", "3", "0"].includes(ctx.body)) {
                return fallBack("Respuesta no válida, por favor seleccione una de las opciones.");
            }
            switch (ctx.body) {
                case "1":
                    return gotoFlow(flowMenuRest);
                case "2":
                    return gotoFlow(flowReservas);
                case "3":
                    return gotoFlow(flowConsultas);
                case "0":
                    return await flowDynamic("Saliendo... Puedes volver a acceder a este menú escribiendo la palabra *menu*.");
            }
        } catch (error) {
            console.error("Error en menuFlow:", error);
            await flowDynamic("Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.");
        }
    });

const main = async () => {
    try {
        const adapterDB = new MockAdapter();
        const adapterFlow = createFlow([
          flowPrincipal,
          flowWelcome,
          flowMenuRest,
          flowReservas,
          flowConsultas,
          menuFlow,
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
}

main();