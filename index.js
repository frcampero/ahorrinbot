require("dotenv").config();
const { Telegraf } = require("telegraf");
const { interpretarGasto } = require("./ai");
const { transcribirAudio } = require("./whisper");
const { exportExpensesLikeCSV } = require("./utils/exportCSV");
const { generateReportPDF } = require("./utils/generateReport");
const mongoose = require("mongoose");
const Expense = require("./models/Expense");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const Tesseract = require("tesseract.js");
const pendingConfirmations = {};

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const bot = new Telegraf(process.env.BOT_TOKEN);

//Export to CSV
bot.command("exportar", async (ctx) => {
  const userId = ctx.from.id;
  console.log("🔍 Ejecutando /export para:", userId);

  try {
    const result = await exportExpensesLikeCSV(userId);
    console.log("📄 Resultado export:", result);

    if (!result) {
      return ctx.reply("No tenés gastos registrados para exportar.");
    }

    const { path, filename } = result;

    await ctx.replyWithDocument({ source: path, filename });

    fs.unlinkSync(path);
  } catch (err) {
    console.error("❌ Error al exportar CSV:", err);
    ctx.reply("Ocurrió un error exportando tus gastos.");
  }
});

//Report expenses to PDF
bot.command("reporte", async(ctx) => {
    const userId = ctx.from.id;

    try {
        const result = await generateReportPDF (userId);

        if(!result) {
            return ctx.reply("No tenés gastos registrados para generar un reporte.")
        }

        const {path, filename } = result;
        await ctx.replyWithDocument({source: path, filename})
        fs.unlinkSync(path)
    } catch (err) {
        console.error("❌ Error generando reporte:", err);
        ctx.reply("Ocurrió un error generando el reporte.")
    }
})

//Response TicketUpload
bot.hears(/^(sí|si|no)$/i, async (ctx) => {
  const userId = ctx.from.id;

  if (!pendingConfirmations[userId]) return;

  const respuesta = ctx.message.text.toLowerCase();

  if (respuesta === "sí" || respuesta === "si") {
    const { amount, category, description } = pendingConfirmations[userId];

    await Expense.create({
      userId: userId.toString(),
      amount,
      category,
      description,
    });

    ctx.reply("✅ Gasto guardado correctamente.");
  } else {
    ctx.reply("❌ Gasto descartado.");
  }

  delete pendingConfirmations[userId];
});

//Detect expense without text
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;

  if (text.startsWith("/")) return;
  try {
    const gasto = await interpretarGasto(text);

    if (gasto && gasto.amount && gasto.category) {
      const { amount, category, description } = gasto;
      await Expense.create({
        userId: userId.toString(),
        amount,
        category,
        description,
      });
      ctx.reply(`💸 Gasto detectado:
- Monto: $${amount}
- Categoría: ${category}
- Descripción: ${description}`);
    } else {
      ctx.reply(
        "No entendí el gasto. ¿Podés escribir algo como 'Gasté 1000 en supermercado'?"
      );
    }
  } catch (error) {
    console.error("❌ Error con el bot:", error);
    ctx.reply("Ocurrió un error procesando tu mensaje.");
  }
});

//Detect expense without voice
bot.on("voice", async (ctx) => {
  const userId = ctx.from.id;
  const fileId = ctx.message.voice.file_id;

  try {
    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl.href, {
      responseType: "arraybuffer",
    });

    const inputPath = `audio-${userId}.oga`;
    const outputPath = `audio-${userId}.ogg`;

    fs.writeFileSync(inputPath, response.data);

    // Convert with ffmpeg from .oga to .ogg
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

bot.on("photo", async (ctx) => {
  const userId = ctx.from.id;
  const photoArray = ctx.message.photo;
  const fileId = photoArray[photoArray.length - 1].file_id;

  try {
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const imageBuffer = (
      await axios.get(fileLink.href, { responseType: "arraybuffer" })
    ).data;

    // OCR Tesseract
    const result = await Tesseract.recognize(imageBuffer, "eng");
    const text = result.data.text;

    console.log("🧾 Texto extraído:", text);
    const gasto = await interpretarGasto(text);

    if (gasto && gasto.amount && gasto.category) {
      const { amount, category, description } = gasto;

      // Save temporarily for confirmation
      pendingConfirmations[userId] = { amount, category, description };

      ctx.reply(`📷 Gasto detectado en la imagen:
- Monto: $${amount}
- Categoría: ${category}
- Descripción: ${description}
¿Querés guardarlo? Responé "sí" o "no".`);
    } else {
      ctx.reply(
        "No logré entender el gasto en la imagen. ¿Podés intentar con otra más clara?"
      );
    }
  } catch (err) {
    console.error("❌ Error procesando imagen:", err);
    ctx.reply("Ocurrió un error procesando la imagen.");
  }
});

mongoose.connect(process.env.MONGO_URI);

bot.launch();
console.log("🤖 Ahorrín Bot está activo...");

//Commands to User Experience
bot.telegram.setMyCommands([
  {
    command: "exportar",
    description: "📁 Exportar tus gastos como archivo CSV",
  },
  {
    command: "reporte",
    description: "📊 Generar un reporte visual en PDF con tus gastos"
  }
]);

// 🕒 Send a weekly summary every Sunday at 8:00 PM.
cron.schedule("0 20 * * 0", async () => {
  console.log("⏰ Enviando resumen semanal...");

  try {
    //We are looking for all unique users
    const users = await Expense.distinct("userId");

    for (const userId of users) {
      //Expenses of the week
      const fromSevenDays = new Date();
      fromSevenDays.setDate(fromSevenDays.getDate() - 7);

      const gastos = await Expense.find({
        userId,
        date: { $gte: fromSevenDays },
      });

      if (gastos.length === 0) continue;

      const total = gastos.reduce((acc, g) => acc + g.amount, 0);

      let resumen = `📊 *Resumen semanal de tus gastos*\nTotal: $${total}\n\n`;

      gastos.forEach((g) => {
        resumen += `• $${g.amount} en ${g.category} - ${g.description}\n`;
      });

      await bot.telegram.sendMessage(userId, resumen, {
        parse_mode: "Markdown",
      });
    }
  } catch (err) {
    console.log("❌ Error enviando resumen semanal:", err);
  }
});


//Response for the uploaded photo
bot.hears(/^(sí|si|no)$/i, async (ctx) => {
  const userId = ctx.from.id;

  if (!pendingConfirmations[userId]) return;

  const respuesta = ctx.message.text.toLowerCase();

  if (respuesta === "sí" || respuesta === "si") {
    const { amount, category, description } = pendingConfirmations[userId];

    await Expense.create({
      userId: userId.toString(),
      amount,
      category,
      description,
    });

    ctx.reply("✅ Gasto guardado correctamente.");
  } else {
    ctx.reply("❌ Gasto descartado.");
  }

  delete pendingConfirmations[userId];
});