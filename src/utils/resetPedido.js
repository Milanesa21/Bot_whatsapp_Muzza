// resetPedido.js
const resetPedido = async (state) => {
  await state.update({
    pedidoActual: {
      tipo: null,
      items: [],
      delivery: false,
      direccion: "",
      detalles: null,
      nombreCliente: null,
      metodoPago: null,
      horario: null,
      total: 0,
    },
  });
};

const getPedidoActual = async (state) => {
  const currentState = await state.getMyState();
  return (
    currentState?.pedidoActual || {
      tipo: null,
      items: [],
      delivery: false,
      direccion: "",
      detalles: null,
      nombreCliente: null,
      metodoPago: null,
      horario: null,
      total: 0,
    }
  );
};

module.exports = { resetPedido, getPedidoActual };
