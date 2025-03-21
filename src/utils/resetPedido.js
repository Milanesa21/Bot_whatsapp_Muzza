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
  pedidoActual = {
    tipo: null,
    items: [],
    delivery: null,
    direccion: null,
    detalles: null,
    nombreCliente: null,
    metodoPago: null,
    horario: null,
    total: 0,
  };
};

module.exports = { resetPedido, pedidoActual };
