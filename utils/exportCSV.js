const fs = require('fs');
const { Parser } = require('json2csv');
const Expense = require("../models/Expense");

async function exportExpensesLikeCSV(userId) {
    const gastos = await Expense.find({ userId });

    if (gastos.length === 0) return null;

    const fields = ["amount", "category", "description", "date"];
    const parser = new Parser({ fields });
    const csv = parser.parse(gastos);

    const filename = `gastos-${userId}.csv`;
    const path = `./${filename}`;

    fs.writeFileSync(path, csv);

    return { path, filename };
}

module.exports = { exportExpensesLikeCSV };