const fetch = require("node-fetch");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chat = async (prompt, text) => {
  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: text },
          ],
          max_tokens: 150,
        }),
      }
    );

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Respuesta de DeepSeek:", data);

    // Verificar si choices existe y tiene elementos
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Respuesta inesperada de la API de DeepSeek");
    }

    await delay(1000); // Retardo opcional
    return data.choices[0].message.content;
  } catch (err) {
    console.error("Error al conectar con DeepSeek:", err);
    return "ERROR";
  }
};

module.exports = chat;
