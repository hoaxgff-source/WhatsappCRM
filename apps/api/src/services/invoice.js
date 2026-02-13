import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export async function generateInvoicePdf({ invoiceNumber, businessName, customerName, amount, currency }) {
  const outputDir = path.join(process.cwd(), 'invoices');
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${invoiceNumber}.pdf`);

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(22).text(`${businessName} Invoice`);
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Customer: ${customerName}`);
    doc.text(`Amount: ${currency} ${Number(amount).toFixed(2)}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.end();

    stream.on('finish', () => resolve(filePath));
  });
}
