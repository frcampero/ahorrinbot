const fs = require("fs");
const { generateReportPDF } = require("../utils/generateReport");

module.exports = (bot) => {
  bot.command("reporte", async (ctx) => {
    const userId = ctx.from.id;

    try {
      const result = await generateReportPDF(userId);

      if (!result) {
        return ctx.reply("No tenés gastos registrados para generar un reporte.");
      }

      const { path, filename } = result;
      await ctx.replyWithDocument({ source: path, filename });
      fs.unlinkSync(path);
    } catch (err) {
      console.error("❌ Error generando reporte:", err);
      ctx.reply("Ocurrió un error generando el reporte.");
    }
  });
};
