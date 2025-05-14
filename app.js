// app.js (servidor principal)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const { init: initSocket } = require("./socket");   
const { createBot, createProvider, createFlow } = require("@bot-whatsapp/bot");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/json");
const QRPortalWeb = require("@bot-whatsapp/portal");

const pedidosRoutes = require("./routes/pedidosRoutes");
const { inicializarBaseDeDatos } = require("./db");

// flujos modularizados
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
const FlowSeleccionMenu = require("./src/flows/FlowSeleccionMenu");
const flowGaseosas = require("./src/flows/flowGaseosa");
const flowPastas = require("./src/flows/flowPastas");
const flowPanaderia = require("./src/flows/FlowPanaderia")
const flowCantidad = require("./src/flows/FlowCantidad")

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
  flowGaseosas,
  flowPastas,
  flowPanaderia,
  flowCantidad,
];
const app = express();
app.set("trust proxy", true);

// CORS
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

// Middleware CORS adicional
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
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// 🔔 Inyectamos `io` en cada petición para poder emitir desde las rutas
const server = http.createServer(app);
const io = initSocket(server, {
  origin: [
    "http://localhost:3000",
    "https://frontpedidosmuzza-production.up.railway.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/pedidos", pedidosRoutes);

// crear carpeta tmp si no existe
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

// socket.io básico para logging de conexiones
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✅");
});

// inicializar DB y arrancar bot
inicializarBaseDeDatos()
  .then(() => {
    console.log("✅ Base de datos inicializada correctamente.");
    main();
  })
  .catch((err) => {
    console.error("❌ Error al inicializar la base de datos:", err);
    process.exit(1);
  });

const main = async () => {
  try {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow(flujos);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    const PORT = process.env.PORT || 7000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });


    if (process.env.NODE_ENV !== "production") {
      QRPortalWeb({ port: 5000 });
      console.log("🔓 QR Portal en http://localhost:5000");
    }
  } catch (error) {
    console.error("❌ Error al iniciar el bot:", error);
  }
};
