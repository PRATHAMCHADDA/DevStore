import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Invoice } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVOICES_DIR = path.join(__dirname, '../uploads/invoices');

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

export const generateInvoicePDF = async (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const invoiceNum = `INV-${order.orderId}`;
      const fileName = `invoice_${order.orderId}.pdf`;
      const filePath = path.join(INVOICES_DIR, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // --- Header Design ---
      doc
        .fillColor('#2563eb')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('DEVSTORE', 50, 50);

      doc
        .fillColor('#4b5563')
        .fontSize(10)
        .font('Helvetica')
        .text('Premium Electronics & SaaS Store', 50, 80)
        .text('support@devstore.com | http://localhost:5000', 50, 95);

      doc
        .fillColor('#111827')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 50, { align: 'right' });

      doc
        .fillColor('#4b5563')
        .fontSize(9)
        .font('Helvetica')
        .text(`Invoice No: ${invoiceNum}`, 400, 75, { align: 'right' })
        .text(`Date Placed: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' })
        .text(`Payment: ${order.paymentMethod.toUpperCase()}`, 400, 105, { align: 'right' });

      doc.moveDown(3);
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 130).lineTo(550, 130).stroke();

      // --- Addresses ---
      doc.moveDown(2);
      
      const billingTop = 150;
      doc
        .fillColor('#1f2937')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Billed To:', 50, billingTop);
        
      doc
        .fillColor('#4b5563')
        .fontSize(9)
        .font('Helvetica')
        .text(order.shippingAddress.name || 'Customer Name', 50, billingTop + 15)
        .text(order.shippingAddress.phone || '', 50, billingTop + 30)
        .text(order.shippingAddress.street || '', 50, billingTop + 45)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 50, billingTop + 60)
        .text(order.shippingAddress.country || '', 50, billingTop + 75);

      doc
        .fillColor('#1f2937')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Shipped To:', 300, billingTop);

      doc
        .fillColor('#4b5563')
        .fontSize(9)
        .font('Helvetica')
        .text(order.shippingAddress.name || 'Customer Name', 300, billingTop + 15)
        .text(order.shippingAddress.phone || '', 300, billingTop + 30)
        .text(order.shippingAddress.street || '', 300, billingTop + 45)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 300, billingTop + 60)
        .text(order.shippingAddress.country || '', 300, billingTop + 75);

      // --- Item Table ---
      let itemTableTop = 260;
      doc.moveDown(6);
      
      doc
        .fillColor('#1f2937')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Item Description', 50, itemTableTop)
        .text('Qty', 330, itemTableTop, { width: 30, align: 'right' })
        .text('Unit Price', 380, itemTableTop, { width: 70, align: 'right' })
        .text('Total', 480, itemTableTop, { width: 70, align: 'right' });

      doc.strokeColor('#d1d5db').lineWidth(1).moveTo(50, itemTableTop + 15).lineTo(550, itemTableTop + 15).stroke();

      let currentTop = itemTableTop + 25;
      
      for (const item of order.items) {
        doc
          .fillColor('#4b5563')
          .fontSize(9)
          .font('Helvetica')
          .text(item.name, 50, currentTop, { width: 260 })
          .text(item.quantity.toString(), 330, currentTop, { width: 30, align: 'right' })
          .text(`$${item.price.toFixed(2)}`, 380, currentTop, { width: 70, align: 'right' })
          .text(`$${(item.quantity * item.price).toFixed(2)}`, 480, currentTop, { width: 70, align: 'right' });

        currentTop += 25;
      }

      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, currentTop).lineTo(550, currentTop).stroke();

      // --- Totals ---
      currentTop += 15;
      const totalLabelLeft = 380;
      const totalValLeft = 480;

      doc
        .fontSize(9)
        .fillColor('#4b5563')
        .text('Subtotal:', totalLabelLeft, currentTop, { align: 'right' })
        .text(`$${order.prices.subtotal.toFixed(2)}`, totalValLeft, currentTop, { align: 'right' });

      doc
        .text('Shipping:', totalLabelLeft, currentTop + 15, { align: 'right' })
        .text(`$${order.prices.shipping.toFixed(2)}`, totalValLeft, currentTop + 15, { align: 'right' });

      doc
        .text('Tax (15%):', totalLabelLeft, currentTop + 30, { align: 'right' })
        .text(`$${order.prices.tax.toFixed(2)}`, totalValLeft, currentTop + 30, { align: 'right' });

      if (order.prices.discount > 0) {
        doc
          .fillColor('#10b981')
          .text('Discount Applied:', totalLabelLeft, currentTop + 45, { align: 'right' })
          .text(`-$${order.prices.discount.toFixed(2)}`, totalValLeft, currentTop + 45, { align: 'right' });
      }

      const grandTop = order.prices.discount > 0 ? currentTop + 65 : currentTop + 50;
      doc
        .fontSize(11)
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .text('Grand Total:', totalLabelLeft, grandTop, { align: 'right' })
        .text(`$${order.prices.grandTotal.toFixed(2)}`, totalValLeft, grandTop, { align: 'right' });

      // --- Footer ---
      doc
        .fontSize(9)
        .fillColor('#9ca3af')
        .font('Helvetica-Oblique')
        .text('Thank you for shopping with DevStore Tech.', 50, 700, { align: 'center', width: 500 });

      doc.end();

      writeStream.on('finish', async () => {
        try {
          // Save Invoice receipt link into Sequelize
          const relativePath = `/uploads/invoices/${fileName}`;
          await Invoice.create({
            orderId: order._id.toString(),
            invoiceNumber: invoiceNum,
            pdfPath: relativePath,
            amount: order.prices.grandTotal
          });
          resolve(relativePath);
        } catch (err) {
          reject(err);
        }
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
