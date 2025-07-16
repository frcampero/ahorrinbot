const Expense = require('../models/Expense');

module.exports = (bot) => {
  bot.command("monthly", async (ctx) => {
    const userId = ctx.from.id.toString();

    try {
      const gastosPorMes = await Expense.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]);

      if (gastosPorMes.length === 0) {
        return ctx.reply("📭 No tenés gastos registrados.");
      }

      let respuesta = "📅 *Gastos por mes:*\n\n";

      for (const gasto of gastosPorMes) {
        const { year, month } = gasto._id;
        respuesta += `• ${month}/${year}: *$${gasto.total.toFixed(2)}*\n`;
      }

      ctx.reply(respuesta, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("❌ Error al obtener gastos por mes:", err);
      ctx.reply("Ocurrió un error al consultar tus gastos.");
    }
  });
};
