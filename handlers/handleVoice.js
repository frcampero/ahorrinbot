const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const { transcribirAudio } = require("../whisper");
const { interpretarGasto } = require("../ai");
const Expense = require("../models/Expense");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = (bot) => {
  bot.on("voice", async (ctx) => {
    const userId = ctx.from.id;
    const fileId = ctx.message.voice.file_id;

    try {
      const fileUrl = await ctx.telegram.getFileLink(fileId);
      const response = await axios.get(fileUrl.href, { responseType: "arraybuffer" });

      const inputPath = `audio-${userId}.oga`;
      const outputPath = `audio-${userId}.ogg`;

      fs.writeFileSync(inputPath, response.data);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .output(outputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const text = await transcribirAudio(outputPath);

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      const gasto = await interpretarGasto(text);

      if (gasto && gasto.amount && gasto.category) {
        const { amount, category, description } = gasto;
        await Expense.create({ userId, amount, category, description });

        ctx.reply(`🎙️ Gasto por voz registrado:
- Monto: $${amount}
- Categoría: ${category}
- Descripción: ${description}`);
      } else {
        ctx.reply("No entendí lo que dijiste. ¿Podés repetirlo?");
      }
    } catch (error) {
      console.error("❌ Error al procesar audio:", error);
      ctx.reply("Ocurrió un error procesando tu audio.");
    }
  });
};
