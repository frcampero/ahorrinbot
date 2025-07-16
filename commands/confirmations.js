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
