const Expense = require("../models/Expense");

bot.command("export", async (ctx) => {
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