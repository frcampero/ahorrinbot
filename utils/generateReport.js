const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const PDFDocument = require("pdfkit");
const Expense = require("../models/Expense");

const width = 600;
const height = 400;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

async function generateReportPDF(userId) {
  const gastos = await Expense.find({ userId });

  if (gastos.length === 0) return null;

  const totalPorCategoria = {};

  gastos.forEach((gasto) => {
    if (!totalPorCategoria[gasto.category]) {
      totalPorCategoria[gasto.category] = 0;
    }
    totalPorCategoria[gasto.category] += gasto.amount;
  });

  const labels = Object.keys(totalPorCategoria);
  const data = Object.values(totalPorCategoria);

  const chartBuffer = await chartCanvas.renderToBuffer({
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos por categoría",
          data,
        },
      ],
    },
  });

  const filename = `reporte-gastos-${userId}.pdf`;
  const path = `./${filename}`;

  // Here we use a promise to wait for the PDF to finish writing.
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(path);
    doc.pipe(writeStream);

    doc.fontSize(20).text("Reporte de Gastos", { align: "center" });
    doc.moveDown();
    doc.image(chartBuffer, { fit: [500, 300], align: "center" });

    doc.moveDown();
    doc.fontSize(12).text("Desglose por categoría:", { underline: true });
    labels.forEach((cat, i) => {
      doc.text(`- ${cat}: $${data[i]}`);
    });

    doc.end();

    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return { path, filename };
}

module.exports = { generateReportPDF };
