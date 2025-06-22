const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema ({
    userId: {type: String, required: true},
    amount: { type: Number, required: true},
    category: { type: String, required: true},
    description: { type: String},
    date: { type: Date, default: Date.now}
});

module.exports = mongoose.model("Expense", ExpenseSchema)