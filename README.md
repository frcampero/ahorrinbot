# 🤖 Ahorrín Bot – Telegram Expense Tracker with AI

Ahorrín Bot is a Telegram bot that helps you **track personal expenses using natural language**, voice messages, and photos. Built with Node.js, MongoDB, and AI integration, it provides a simple and intuitive way to manage your spending.

---

## ✨ Features

- 📝 Register expenses by sending a text like: `Gasté 1500 en supermercado`
- 🎙️ Register expenses via **voice message** (speech-to-text with Whisper)
- 📸 Extract expenses from **photos of receipts** using OCR (Tesseract.js)
- 📦 Export all expenses as CSV with `/exportar`
- 📊 Generate visual reports (PDF with charts) using `/reporte`
- ⏰ Weekly summaries sent every Sunday at 8 PM
- 🧠 AI-powered expense interpretation using GPT-like model

---

## 💻 Tech Stack

- **Node.js** + **Telegraf.js** (Telegram API)
- **MongoDB** with Mongoose (data storage)
- **Tesseract.js** (OCR for images)
- **Whisper API** (voice transcription)
- **OpenAI or local LLM** (natural language parsing)
- **PDFKit** + **Chart.js** for report generation
- **Cron** for scheduled weekly summaries

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/frcampero/ahorrin-bot.git
cd ahorrin-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
BOT_TOKEN=your_telegram_bot_token
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the bot

```bash
node index.js
```

---

## 📷 Example

**User:** `Gasté 1200 en farmacia`  
**Bot:**  
```
💸 Gasto detectado:
- Monto: $1200
- Categoría: farmacia
- Descripción: compra en farmacia
```

---

## 📂 Project Structure

```
.
├── index.js
├── ai.js
├── whisper.js
├── models/
│   └── Expense.js
├── utils/
│   ├── exportCSV.js
│   └── generateReport.js
├── .env
├── .gitignore
```

---

## 🔐 Notes

- `.env` is ignored via `.gitignore` for security
- Bot uses OpenAI (or compatible) to interpret expenses. You can replace it with a local model
- Weekly reports are sent using `node-cron`

---

## 📌 To-Do

- [ ] Add support for monthly reports
- [ ] Add authentication layer

---

## 📄 License

MIT – Feel free to use, modify, and improve.  
Made with 💚 by [Federico Campero](https://fcampero.dev)
