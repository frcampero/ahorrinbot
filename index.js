const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const cron = require("node-cron");

//Bot instance
const bot = new Telegraf(process.env.BOT_TOKEN);

//Shared state
const pendingConfirmations = {};

//Commands exports:
const exportCommand = require("./commands/export");
const monthlyCommand = require("./commands/monthly");
const monthCommand = require("./commands/month");
const reportCommand = require('./commands/report');
const textCommand = require('./commands/text')
const confirmationHandler = require("./commands/confirmations");

//Handlers export
const handlePhoto = require("./handlers/handlePhoto");
const handleVoice = require("./handlers/handleVoice");

//Cron export
const weeklySummary = require("./cron/weeklySummary");


//Commands executed
exportCommand(bot)
monthlyCommand(bot)
monthCommand(bot);
reportCommand(bot);
textCommand(bot);
confirmationHandler(bot, pendingConfirmations);


//Handle executed
handlePhoto(bot, pendingConfirmations);
handleVoice(bot);

//Cron executed
cron.schedule("0 20 * * 0", () => weeklySummary(bot));


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
    description: "📊 Generar un reporte visual en PDF con tus gastos",
  },
  {
    command: "mensual",
    description: "📅 Ver total de gastos agrupados por mes",
  },
  {
    command: "mes",
    description: "🔎 Consultar gastos de un mes específico (ej: /mes 2025-07)",
  },
]);