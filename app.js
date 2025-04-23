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
const express = require("express");
const app = express();
const pedidosRoutes = require("./routes/pedidosRoutes");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { inicializarBaseDeDatos } = require("./db");

 const certificate = fs.readFileSync(path.join(__dirname, "cert.pem"));
 const privateKey = fs.readFileSync(path.join(__dirname, "key.pem"));
 

const https = require("https");





// Importar los flujos modularizados
const flowPrincipal = require("./src/flows/FlowPrincipal");
const flowWelcome = require("./src/flows/FlowWelcome");
const flowMenuPizzeria = require("./src/flows/FlowPizzeria");
const flowMenuPanaderia = require("./src/flows/FlowPanaderia");
const flowMenuSandwiches = require("./src/flows/FlowSandwiches");
const flowMenuEmpanadas = require("./src/flows/flowMenuEmpanadas");
const flowSeleccionTamaño = require("./src/flows/FlowSeleccionTamaño");
const flowAgregarMas = require("./src/flows/FlowAgregarmas");
const flowDelivery = require("./src/flows/FlowDelivery");
const flowDireccion = require("./src/flows/FlowDireccion");
const flowDetallesPedido = require("./src/flows/FlowDetalles");
const flowNombreCliente = require("./src/flows/FlowNombrecliente");
const flowMetodoPago = require("./src/flows/FlowMetodoPago");
const flowHorario = require("./src/flows/FlowHorario");
const flowHorarioEspecifico = require("./src/flows/FlowHoraEspecifica");
const flowConfirmacionPedido = require("./src/flows/FlowConfirmacion");
const flowConsultas = require("./src/flows/FlowConsultas");
const flowVoice = require("./src/flows/FlowVoice");
const FlowSeleccionMenu = require("./src/flows/FlowSeleccionMenu");
const flowGaseosas = require("./src/flows/flowGaseosa");

const flujos = [
  flowPrincipal,
  flowWelcome,
  flowMenuPizzeria,
  flowMenuPanaderia,
  flowMenuSandwiches,
  flowMenuEmpanadas,
  flowSeleccionTamaño,
  flowAgregarMas,
  flowDelivery,
  flowDireccion,
  flowDetallesPedido,
  flowNombreCliente,
  flowMetodoPago,
  flowHorario,
  flowHorarioEspecifico,
  flowConfirmacionPedido,
  flowConsultas,
  FlowSeleccionMenu,
  flowVoice,
  flowGaseosas,
];


// Configuración CORS para Express
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://frontpedidosmuzza-production.up.railway.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware adicional para CORS
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin ||
      "http://localhost:3000" ||
      "https://frontpedidosmuzza-production.up.railway.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/pedidos", pedidosRoutes);

const server = https.createServer({ cert: certificate, key: privateKey }, app);
// Configuración de Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://frontpedidosmuzza-production.up.railway.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  },
  transports: ["websocket", "polling"],
});

// Añade para manejar proxies
app.set('trust proxy', true);


// Escuchar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado:", socket.id);

  // Escuchar desconexiones
  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado:", socket.id);
  });
});

// Ruta de ejemplo
app.get("/", (req, res) => {
  res.send("Servidor Socket.IO funcionando");
});

// Creación de carpeta temporal para archivos de voz si no existe
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

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
      flowMenuEmpanadas,
      flowGaseosas,
      flowSeleccionTamaño,
      flowAgregarMas,
      flowDelivery,
      flowDireccion,
      flowDetallesPedido,
      flowNombreCliente,
      flowMetodoPago,
      flowHorario,
      flowHorarioEspecifico,
      flowConfirmacionPedido,
      flowConsultas,
      FlowSeleccionMenu,
      flowVoice,
    ]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    server.listen(4000, () => {
      console.log("Servidor backend corriendo en http://localhost:4000");
    });

    // Iniciar el servidor del portal QR
    QRPortalWeb({ port: 5000 });
    console.log("Servidor iniciado en http://localhost:5000");
  } catch (error) {
    console.error("Error en main:", error);
  }
};
