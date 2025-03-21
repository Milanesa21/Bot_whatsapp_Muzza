const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  "Lo siento, pero no reconozco esa palabra. Si deseas hacer un pedido o hacer una consulta, escribenos hola y empezaremos con tu pedido"
);

module.exports = flowWelcome ;
