// resetPedido.js
const resetPedido = async (state) => {
  await state.update({
    pedidoActual: {
      // Estructura inicial del pedido
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
  const currentState = await state.getMyState(); // Obtiene el estado ACTUAL del usuario
  return (
    currentState?.pedidoActual || {
      // Si no existe, devuelve estructura inicial
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
