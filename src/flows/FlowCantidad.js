const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { getPedidoActual } = require("../utils/resetPedido");
const flowAgregarMas = require("./FlowAgregarmas");
const flowSeleccionMenu = require("./FlowSeleccionMenu");

const flowCantidad = addKeyword(EVENTS.ACTION).addAnswer(
  "Ingresa la cantidad deseada (solo el número):",
  { capture: true },
  async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
    const cantidadInput = ctx.body.trim();
    const cantidad = parseInt(cantidadInput);
    const currentPedido = await getPedidoActual(state);
    const producto = currentPedido?.ultimoProducto;

    // Validar que existe un producto seleccionado
    if (!producto) {
      console.error("Error en flowCantidad: No hay producto seleccionado.");
      await flowDynamic("❌ Error: Producto no detectado. Volviendo al menú.");
      await new Promise((resolve) => setTimeout(resolve, 100));
      return gotoFlow(flowSeleccionMenu);
    }

    // Determinar nombre, precio y unidad según el tipo de producto
    let nombre,
      precioUnitario,
      unidad = "unidad";
    if (typeof producto === "string") {
      // Caso Empanadas
      nombre = producto;
      precioUnitario = 1700;
    } else if (producto.nombre && producto.precio !== undefined) {
      // Caso Gaseosas, Panadería, Pastas, etc.
      nombre = producto.nombre;
      precioUnitario = producto.precio;
      unidad = producto.unidad || unidad;
    } else {
      console.error("Producto inválido:", producto);
      await flowDynamic("❌ Error interno. Volviendo al menú principal.");
      await new Promise((resolve) => setTimeout(resolve, 100));
      return gotoFlow(flowSeleccionMenu);
    }

    // Validar cantidad
    if (isNaN(cantidad) || cantidad < 1) {
      return fallBack("❌ Ingresa un número válido mayor a 0.");
    }
    if (cantidad > 50) {
      return fallBack("❌ Máximo 50 unidades por ítem.");
    }

    // Crear ítem del pedido
    const precioTotal = precioUnitario * cantidad;
    const nuevoItem = {
      nombre: nombre,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      precioTotal: precioTotal,
      ...(unidad && { unidad: unidad }),
    };

    // Actualizar estado
    const nuevosItems = currentPedido.items
      ? [...currentPedido.items, nuevoItem]
      : [nuevoItem];
    const totalActualizado = (currentPedido.total || 0) + precioTotal;

    await state.update({
      pedidoActual: {
        ...currentPedido,
        items: nuevosItems,
        total: totalActualizado,
        ultimoProducto: null,
      },
    });

    // Mensaje de confirmación
    await flowDynamic(
      `✅ Agregado:\n` +
        `📦 *${nombre}*\n` +
        `Cantidad: ${cantidad}${unidad ? ` ${unidad}(s)` : ""}\n` +
        `Precio unitario: $${precioUnitario}\n` +
        `Subtotal: $${precioTotal}\n\n` +
        `🛒 Total acumulado: $${totalActualizado}`
    );

    // Redirigir
    return gotoFlow(flowAgregarMas);
  }
);

module.exports = flowCantidad;
