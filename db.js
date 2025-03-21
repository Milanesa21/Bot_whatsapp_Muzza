const { Client } = require("pg");
require("dotenv").config(); 


// Configuración de la conexión
const config = {
  user: process.env.DB_USER, // Usuario de PostgreSQL
  host: process.env.DB_HOST, // Host de PostgreSQL
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  port: process.env.DB_PORT, // Puerto de PostgreSQL
  database: process.env.DB_NAME, // Base de datos específica
  ssl: {
    rejectUnauthorized: process.env.DB_SSL === "true", // Convertir a booleano
  },
};
// Crear una instancia del cliente
const client = new Client(config);

// Función para verificar y crear las tablas
const crearTablas = async () => {
  await client.connect(); // Conectar a la base de datos específica

  try {
    // Verificar si la tabla 'pedidos' existe
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'pedidos'
      );
    `);

    if (!res.rows[0].exists) {
      // Si no existe, crear la tabla
      await client.query(`
        CREATE TABLE pedidos (
          id SERIAL PRIMARY KEY,
          tipo VARCHAR(50) NOT NULL,
          items JSONB NOT NULL,
          delivery BOOLEAN NOT NULL,
          direccion TEXT,
          detalles TEXT,
          nombre_cliente VARCHAR(100) NOT NULL,
          metodo_pago VARCHAR(50) NOT NULL,
          horario VARCHAR(50) NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
          is_done BOOLEAN DEFAULT FALSE,
          is_new BOOLEAN DEFAULT TRUE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Tabla 'pedidos' creada exitosamente.");
    } else {
      console.log("La tabla 'pedidos' ya existe.");
    }
  } catch (error) {
    console.error("Error al verificar/crear las tablas:", error);
  }
};

// Función principal para inicializar la base de datos
const inicializarBaseDeDatos = async () => {
  await crearTablas(); // Verificar y crear las tablas
};

// Exportar el cliente y la función de inicialización
module.exports = { client, inicializarBaseDeDatos };
