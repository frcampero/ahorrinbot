const axios = require("axios");
const { Markup } = require("telegraf");
const Tesseract = require("tesseract.js");
const { interpretarGasto } = require("../ai/ai");

module.exports = (bot, pendingConfirmations) => {
  bot.on("photo", async (ctx) => {
    const userId = ctx.from.id.toString();
    const photoArray = ctx.message.photo;
    const fileId = photoArray[photoArray.length - 1].file_id;

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const imageBuffer = (
        await axios.get(fileLink.href, { responseType: "arraybuffer" })
      ).data;

      // OCR con Tesseract
      const result = await Tesseract.recognize(imageBuffer, "eng");
      const text = result.data.text;

      console.log("🧾 Texto extraído:", text);
      const gasto = await interpretarGasto(text);

      if (gasto && gasto.amount && gasto.category) {
        const { amount, category, description } = gasto;

        // Guardar temporalmente
        pendingConfirmations[userId] = { amount, category, description };

        // Mostrar mensaje con botones
        await ctx.reply(
          `📷 Gasto detectado en la imagen:
- Monto: $${amount}
- Categoría: ${category}
- Descripción: ${description}
¿Querés guardarlo?`,
          Markup.inlineKeyboard([
            [
              Markup.button.callback("✅ Sí", `confirm_yes_${userId}`),
              Markup.button.callback("❌ No", `confirm_no_${userId}`),
            ],
          ])
        );
      } else {
        ctx.reply("No logré entender el gasto en la imagen. ¿Podés intentar con otra más clara?");
      }
    } catch (err) {
      console.error("❌ Error procesando imagen:", err);
      ctx.reply("Ocurrió un error procesando la imagen.");
    }
  });
};
