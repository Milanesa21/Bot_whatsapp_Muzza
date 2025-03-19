const { Client } = require("pg");

// Configuración de la conexión
const config = {
  user: "postgres", // Usuario de PostgreSQL
  host: "localhost", // Host de PostgreSQL
  password: "1234", // Contraseña del usuario
  port: 5432, // Puerto de PostgreSQL
  database: "Pizzeria", // Base de datos específica
};

// Crear una instancia del cliente
const client = new Client(config);

// Función para verificar y crear la base de datos
const crearBaseDeDatos = async () => {
  const tempClient = new Client({ ...config, database: "postgres" }); // Conectar a la base de datos por defecto
  await tempClient.connect();

  try {
    // Verificar si la base de datos existe
    const res = await tempClient.query(
      `SELECT 1 FROM pg_database WHERE datname = 'Pizzeria'`
    );

    if (res.rowCount === 0) {
      // Si no existe, crear la base de datos
      await tempClient.query(`CREATE DATABASE Pizzeria`);
      console.log("Base de datos creada exitosamente.");
    } else {
      console.log("La base de datos ya existe.");
    }
  } catch (error) {
    console.error("Error al verificar/crear la base de datos:", error);
  } finally {
    await tempClient.end(); // Cerrar la conexión temporal
  }
};

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
          detalles TEXT,
          nombre_cliente VARCHAR(100) NOT NULL,
          metodo_pago VARCHAR(50) NOT NULL,
          horario VARCHAR(50) NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
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
  await crearBaseDeDatos(); // Verificar y crear la base de datos
  await crearTablas(); // Verificar y crear las tablas
};

// Exportar el cliente y la función de inicialización
module.exports = { client, inicializarBaseDeDatos };
