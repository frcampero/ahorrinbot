const Expense = require("../models/Expense");

module.exports = (bot, pendingConfirmations) => {
  bot.on("callback_query", async (ctx) => {
    const userId = ctx.from.id.toString();
    const data = ctx.callbackQuery.data;

    if (!pendingConfirmations[userId]) {
      await ctx.answerCbQuery("No hay gasto pendiente.");
      return;
    }

    if (data === `confirm_yes_${userId}`) {
      const { amount, category, description } = pendingConfirmations[userId];

      await Expense.create({
        userId,
        amount,
        category,
        description,
      });

      await ctx.reply("✅ Gasto guardado correctamente.");
    } else if (data === `confirm_no_${userId}`) {
      await ctx.reply("❌ Gasto descartado.");
    }

    delete pendingConfirmations[userId];

    await ctx.answerCbQuery();           // Cierra popup en Telegram
    await ctx.editMessageReplyMarkup();  // Elimina botones del mensaje original
  });
};
