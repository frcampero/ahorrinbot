const Expense = require("../models/Expense");

module.exports = (bot) => {
  bot.command("mes", async (ctx) => {
    const args = ctx.message.text.split(" ");
    const userId = ctx.from.id.toString();

    // Verificar si el usuario escribió un mes válido
    if (!args[1] || !/^\d{4}-\d{2}$/.test(args[1])) {
      return ctx.reply("📌 Usá el formato: /mes 2025-07");
    }

    const [year, month] = args[1].split("-").map(Number);
    const start = new Date(year, month - 1, 1); // Primer día del mes
    const end = new Date(year, month, 1);       // Primer día del mes siguiente

    try {
      // Buscar todos los gastos del usuario en ese mes
      const gastos = await Expense.find({
        userId,
        date: { $gte: start, $lt: end }
      });

      if (gastos.length === 0) {
        return ctx.reply("📭 No encontré gastos para ese mes.");
      }

      // Construir respuesta
      let total = 0;
      let respuesta = `📆 *Gastos de ${month}/${year}:*\n\n`;

      for (const gasto of gastos) {
        total += gasto.amount;
        respuesta += `• $${gasto.amount} - ${gasto.category}`;
        if (gasto.description) respuesta += ` (${gasto.description})`;
        respuesta += `\n`;
      }

      respuesta += `\n💰 *Total:* $${total.toFixed(2)}`;

      ctx.reply(respuesta, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("❌ Error en /mes:", err);
      ctx.reply("Ocurrió un error al consultar los gastos del mes.");
    }
  });
};
