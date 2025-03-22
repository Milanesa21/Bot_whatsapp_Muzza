// resetPedido.js
let pedidoActual = {
  tipo: null,
  items: [],
  delivery: false,
  direccion: "",
  detalles: null,
  nombreCliente: null,
  metodoPago: null,
  horario: null,
  total: 0,
};

const resetPedido = () => {
  pedidoActual.tipo = null;
  pedidoActual.items = [];
  pedidoActual.delivery = false;
  pedidoActual.direccion = "";
  pedidoActual.detalles = null;
  pedidoActual.nombreCliente = null;
  pedidoActual.metodoPago = null;
  pedidoActual.horario = null;
  pedidoActual.total = 0;
};

module.exports = { resetPedido, pedidoActual };
