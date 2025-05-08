// socket.js
const { Server } = require("socket.io"); // ← asegúrate de que esté aquí

let io = null;

function init(server, corsOptions) {
  io = new Server(server, { cors: corsOptions });
  return io;
}

function getIO() {
  if (!io) throw new Error("initSocket debe llamarse antes de getIO()");
  return io;
}

module.exports = { init: init, getIO: getIO };
