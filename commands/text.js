const Expense = require("../models/Expense");
const { interpretarGasto } = require("../ai/ai");

module.exports = (bot) => {
  bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    // Ignorar comandos
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
        ctx.reply("No entendí el gasto. ¿Podés escribir algo como 'Gasté 1000 en supermercado'?");
      }
    } catch (error) {
      console.error("❌ Error con el bot:", error);
      ctx.reply("Ocurrió un error procesando tu mensaje.");
    }
  });
};
