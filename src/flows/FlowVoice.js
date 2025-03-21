const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, { flowDynamic }) => {
    await flowDynamic(
      "⚠️ Lo siento, no puedo escuchar mensajes de voz. " +
        "Si deseas hacer un pedido, por favor escríbelo por mensaje de texto. " +
        "¡Gracias por tu comprensión! 😊"
    );
  }
);

module.exports =  flowVoice ;
