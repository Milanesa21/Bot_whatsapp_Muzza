const express = require("express");
const router = express.Router();
const { client } = require("../db"); 

// Obtener todos los pedidos
router.get("/", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM pedidos");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).send("Error al obtener pedidos");
  }
});

// Obtener un pedido por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query("SELECT * FROM pedidos WHERE id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("Pedido no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener el pedido:", error);
    res.status(500).send("Error al obtener el pedido");
  }
});

// Crear un nuevo pedido
router.post("/", async (req, res) => {
  const {
    tipo,
    items,
    delivery,
    direccion,
    detalles,
    nombre_cliente,
    metodo_pago,
    horario,
    total,
    is_done,
  } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO pedidos (tipo, items, delivery, direccion, detalles, nombre_cliente, metodo_pago, horario, total,  is_done) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        tipo,
        JSON.stringify(items),
        delivery,
        direccion,
        detalles,
        nombre_cliente,
        metodo_pago,
        horario,
        total,
        is_done,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).send("Error al crear el pedido");
  }
});

// Actualizar un pedido existente
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    tipo,
    items,
    delivery,
    direccion,
    detalles,
    nombre_cliente,
    metodo_pago,
    horario,
    total,
    is_done,
  } = req.body;
  try {
    const result = await client.query(
      "UPDATE pedidos SET tipo = $1, items = $2, delivery = $3, direccion = $4, detalles = $5, nombre_cliente = $6, metodo_pago = $7, horario = $8, total = $9 WHERE id = $10 RETURNING *",
      [
        tipo,
        JSON.stringify(items),
        delivery,
        direccion,
        detalles,
        nombre_cliente,
        metodo_pago,
        horario,
        total,
        is_done,
        id,
      ]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("Pedido no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar el pedido:", error);
    res.status(500).send("Error al actualizar el pedido");
  }
});

// Eliminar un pedido
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      "DELETE FROM pedidos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ message: "Pedido eliminado", pedido: result.rows[0] });
    } else {
      res.status(404).send("Pedido no encontrado");
    }
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    res.status(500).send("Error al eliminar el pedido");
  }
});

// Marcar un pedido como "no nuevo"
router.put("/:id/markAsRead", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      "UPDATE pedidos SET is_new = false WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("Pedido no encontrado");
    }
  } catch (error) {
    console.error("Error al marcar el pedido como leído:", error);
    res.status(500).send("Error al marcar el pedido como leído");
  }
});

// Marcar un pedido como "listo"
router.put("/:id/markAsDone", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      "UPDATE pedidos SET is_done = true WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("Pedido no encontrado");
    }
  } catch (error) {
    console.error("Error al marcar el pedido como listo:", error);
    res.status(500).send("Error al marcar el pedido como listo");
  }
});

module.exports = router;
