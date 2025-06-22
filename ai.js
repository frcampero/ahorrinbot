const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function interpretarGasto(text) {
  const prompt = `
Extraé la información de gasto del siguiente mensaje. Respondé en JSON:
- "amount": el monto gastado (solo número)
- "category": categoría principal (comida, transporte, ocio, etc)
- "description": breve descripción del gasto

Mensaje: "${text}"
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    let respuesta = completion.choices[0].message.content.trim();

    if (respuesta.startsWith("```")) {
      respuesta = respuesta
        .replace(/```(?:json)?/g, "")
        .replace(/```/g, "")
        .trim();
    }

    return JSON.parse(respuesta);
  } catch (err) {
    console.error("Error con la IA", err);
    return null;
  }
}

module.exports = { interpretarGasto };
