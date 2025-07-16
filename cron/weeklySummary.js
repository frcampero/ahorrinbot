const Expense = require("../models/Expense");

module.exports = async (bot) => {
  console.log("⏰ Enviando resumen semanal...");

  try {
    const users = await Expense.distinct("userId");

    for (const userId of users) {
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
};