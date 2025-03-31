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
const flowDireccion = require("./src/flows/FlowDireccion")
const flowDetallesPedido = require("./src/flows/FlowDetalles");
const flowNombreCliente = require("./src/flows/FlowNombrecliente");
const flowMetodoPago = require("./src/flows/FlowMetodoPago");
const flowHorario = require("./src/flows/FlowHorario");
const flowHorarioEspecifico = require("./src/flows/FlowHoraEspecifica");
const flowConfirmacionPedido = require("./src/flows/FlowConfirmacion");
const flowConsultas = require("./src/flows/FlowConsultas");
const flowVoice = require("./src/flows/FlowVoice");
const FlowSeleccionMenu = require("./src/flows/FlowSeleccionMenu")
const flowGaseosas = require("./src/flows/flowGaseosa")

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


console.log("Flujos cargados:", flujos);

const adapterFlow = createFlow(flujos);

// Configuración Express y Socket.io
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/pedidos", pedidosRoutes);
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// Escuchar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado:", socket.id);

  // Escuchar desconexiones
  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado:", socket.id);
  });
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
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

// Definición de puertos desde variables de entorno
const PORT = process.env.PORT || 3000;

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
    
    // Configurar QR Portal como middleware
    const qrPath = "/qr";
    app.use(qrPath, (req, res, next) => {
      QRPortalWeb().middleware()(req, res, next);
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`- Main API: http://localhost:${PORT}`);
      console.log(`- QR Portal: http://localhost:${PORT}${qrPath}`);
    }).on('error', (error) => {
      console.error(`Error al iniciar el servidor en el puerto ${PORT}:`, error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error en main:", error);
  }}