const { chat } = require("../services/chatService");

const detectarIntencion = async (texto) => {
  const textoLower = texto.toLowerCase();

  const palabrasPizzeria = [
    "pizza",
    "pizzas",
    "pizzería",
    "pizzeria",
    "muzzarella",
    "calabresa",
  ];
  const palabrasPanaderia = [
    "pan",
    "panadería",
    "panaderia",
    "facturas",
    "medialunas",
    "torta",
  ];


  if (palabrasPizzeria.some((palabra) => textoLower.includes(palabra))) {
    return "pizzeria";
  } else if (
    palabrasPanaderia.some((palabra) => textoLower.includes(palabra))
  ) {
    return "panaderia";
  } else if (palabrasConsulta.some((palabra) => textoLower.includes(palabra))) {
    return "consulta";
  }

  const prompt =
    "Determina si este mensaje se refiere a una pizzería, panadería o es una consulta general. Responde solo con una palabra: 'pizzeria', 'panaderia' o 'consulta'.";
  const respuesta = await chat(prompt, texto);
  return respuesta.toLowerCase();
};

module.exports = { detectarIntencion };
