const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chat = async (prompt, text) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; // Asegúrate de tener tu API Key en las variables de entorno
    const model = "gemini-2.0-flash-lite"; // Modelo de Gemini que deseas usar

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\n${text}`, // Combina el prompt y el texto del usuario
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 1, // Controla la creatividad de la respuesta
          topP: 0.95, // Controla la diversidad de la respuesta
          topK: 40, // Controla el muestreo de tokens
          maxOutputTokens: 8192, // Límite de tokens en la respuesta
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey, // Usar la API Key de Gemini
        },
      }
    );

    const data = response.data;
    console.log("Respuesta de Gemini:", data);

    // Verificar si la respuesta contiene el texto generado
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Respuesta inesperada de la API de Gemini");
    }

    await delay(1000); // Retardo opcional
    return data.candidates[0].content.parts[0].text; // Extraer el texto generado
  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    return "ERROR";
  }
};

module.exports = chat;
