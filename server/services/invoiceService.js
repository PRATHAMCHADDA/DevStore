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
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const invoiceNum = `INV-${order.orderId}`;
      const fileName = `invoice_${order.orderId}.pdf`;
      const filePath = path.join(INVOICES_DIR, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      const pageWidth = 595.28; // A4 width in pt
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2); // 515.28 pt

      // ==========================================
      // 1. Sleek Modern Header Band (#0F172A)
      // ==========================================
      doc
        .rect(0, 0, pageWidth, 90)
        .fill('#0F172A');

      // DEVSTORE Logo & Brand Subtitle
      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('DEVSTORE', margin, 22);

      doc
        .fillColor('#94A3B8')
        .fontSize(8.5)
        .font('Helvetica')
        .text('Premium Developer Electronics & SaaS Platform', margin, 50)
        .text('support@devstore.com  •  https://devstore.com', margin, 64);

      // Invoice Badge Card (Top Right Header)
      const badgeX = pageWidth - margin - 150;
      doc
        .roundedRect(badgeX, 18, 150, 54, 6)
        .fillAndStroke('#1E293B', '#334155');

      doc
        .fillColor('#94A3B8')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('INVOICE', badgeX, 26, { width: 150, align: 'center' });

      doc
        .fillColor('#38BDF8')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(invoiceNum, badgeX, 40, { width: 150, align: 'center' });

      // ==========================================
      // 2. Invoice Metadata Ribbon
      // ==========================================
      const metaY = 104;
      doc
        .roundedRect(margin, metaY, contentWidth, 38, 6)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      doc
        .fillColor('#64748B')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('ORDER DATE', margin + 15, metaY + 8)
        .fillColor('#0F172A')
        .fontSize(9)
        .font('Helvetica')
        .text(dateStr, margin + 15, metaY + 20);

      doc
        .fillColor('#64748B')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('PAYMENT METHOD', margin + 160, metaY + 8)
        .fillColor('#0F172A')
        .fontSize(9)
        .font('Helvetica')
        .text((order.paymentMethod || 'COD').toUpperCase(), margin + 160, metaY + 20);

      doc
        .fillColor('#64748B')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('PAYMENT STATUS', margin + 330, metaY + 8);

      // PAID Badge
      doc
        .roundedRect(margin + 330, metaY + 20, 48, 13, 3)
        .fill('#DCFCE7');

      doc
        .fillColor('#166534')
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .text('PAID', margin + 330, metaY + 22, { width: 48, align: 'center' });

      // ==========================================
      // 3. Billing & Shipping Address Cards
      // ==========================================
      const addrY = 154;
      const cardWidth = (contentWidth - 15) / 2; // 250pt
      const cardHeight = 90;

      const addr = order.shippingAddress || {};

      // Billed To Card
      doc
        .roundedRect(margin, addrY, cardWidth, cardHeight, 8)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      doc
        .fillColor('#64748B')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('BILLED TO', margin + 12, addrY + 10);

      doc
        .fillColor('#0F172A')
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text(addr.name || 'Customer Name', margin + 12, addrY + 24, { width: cardWidth - 24, ellipsis: true });

      doc
        .fillColor('#475569')
        .fontSize(8)
        .font('Helvetica')
        .text(addr.phone ? `Phone: ${addr.phone}` : '', margin + 12, addrY + 38)
        .text(addr.street || '', margin + 12, addrY + 50, { width: cardWidth - 24, ellipsis: true })
        .text(`${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`, margin + 12, addrY + 62, { width: cardWidth - 24, ellipsis: true })
        .text(addr.country || '', margin + 12, addrY + 74, { width: cardWidth - 24, ellipsis: true });

      // Shipped To Card
      const shipX = margin + cardWidth + 15;
      doc
        .roundedRect(shipX, addrY, cardWidth, cardHeight, 8)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      doc
        .fillColor('#64748B')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('SHIPPED TO', shipX + 12, addrY + 10);

      doc
        .fillColor('#0F172A')
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text(addr.name || 'Customer Name', shipX + 12, addrY + 24, { width: cardWidth - 24, ellipsis: true });

      doc
        .fillColor('#475569')
        .fontSize(8)
        .font('Helvetica')
        .text(addr.phone ? `Phone: ${addr.phone}` : '', shipX + 12, addrY + 38)
        .text(addr.street || '', shipX + 12, addrY + 50, { width: cardWidth - 24, ellipsis: true })
        .text(`${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`, shipX + 12, addrY + 62, { width: cardWidth - 24, ellipsis: true })
        .text(addr.country || '', shipX + 12, addrY + 74, { width: cardWidth - 24, ellipsis: true });

      // ==========================================
      // 4. Itemized Products Table
      // ==========================================
      const tableY = 258;
      const colItemX = margin + 12;
      const colItemW = 240;
      const colQtyX = margin + 260;
      const colQtyW = 40;
      const colPriceX = margin + 310;
      const colPriceW = 85;
      const colTotalX = margin + 405;
      const colTotalW = 95;

      // Table Header Bar
      doc
        .rect(margin, tableY, contentWidth, 24)
        .fill('#1E293B');

      doc
        .fillColor('#FFFFFF')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('ITEM DESCRIPTION', colItemX, tableY + 7, { width: colItemW })
        .text('QTY', colQtyX, tableY + 7, { width: colQtyW, align: 'center' })
        .text('UNIT PRICE', colPriceX, tableY + 7, { width: colPriceW, align: 'right' })
        .text('TOTAL', colTotalX, tableY + 7, { width: colTotalW, align: 'right' });

      let currentY = tableY + 24;
      const items = order.items || [];
      const rowHeight = 24;

      items.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 1) {
          doc
            .rect(margin, currentY, contentWidth, rowHeight)
            .fill('#F8FAFC');
        }

        const price = item.price || item.discountedPrice || 0;
        const total = (item.quantity || 1) * price;

        doc
          .fillColor('#0F172A')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text(item.name || 'Product Item', colItemX, currentY + 7, { width: colItemW, ellipsis: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text((item.quantity || 1).toString(), colQtyX, currentY + 7, { width: colQtyW, align: 'center' })
          .text(`$${price.toFixed(2)}`, colPriceX, currentY + 7, { width: colPriceW, align: 'right' })
          .fillColor('#0F172A')
          .font('Helvetica-Bold')
          .text(`$${total.toFixed(2)}`, colTotalX, currentY + 7, { width: colTotalW, align: 'right' });

        currentY += rowHeight;

        // Row Divider Line
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(0.5)
          .moveTo(margin, currentY)
          .lineTo(margin + contentWidth, currentY)
          .stroke();
      });

      // ==========================================
      // 5. Dynamic y-Offset Totals & Payment Summary
      // ==========================================
      const summaryY = currentY + 20;
      const summaryW = 260;
      const summaryX = margin + contentWidth - summaryW; // Right-aligned box

      // Safely extract price properties with fallback calculations
      const itemsList = order.items || [];
      const calculatedSubtotal = itemsList.reduce((acc, item) => {
        const price = item.price || item.discountedPrice || 0;
        return acc + (price * (item.quantity || 1));
      }, 0);

      const prices = order.prices || {};
      const subtotal = prices.subtotal || calculatedSubtotal;
      const shipping = prices.shipping !== undefined ? prices.shipping : 0;
      const taxRate = prices.taxRate || 0.15; // 15% standard tax rate
      const tax = prices.tax !== undefined ? prices.tax : (subtotal * taxRate);
      const discount = prices.discount || 0;
      const grandTotal = prices.grandTotal || (subtotal + shipping + tax - discount);

      const summaryRows = [
        { label: 'Subtotal:', value: `$${subtotal.toFixed(2)}` },
        { label: 'Shipping:', value: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` },
        { label: `Tax (${(taxRate * 100).toFixed(0)}% included):`, value: `$${tax.toFixed(2)}` }
      ];

      if (discount > 0) {
        summaryRows.push({ label: 'Discount:', value: `-$${discount.toFixed(2)}`, color: '#16A34A' });
      }

      // Calculate dynamic box height based on number of rows
      const summaryBoxHeight = (summaryRows.length * 20) + 40;

      // Draw background card container
      doc
        .roundedRect(summaryX, summaryY, summaryW, summaryBoxHeight, 8)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      let lineY = summaryY + 12;

      // Render summary items line-by-line with strict dynamic Y offsets
      summaryRows.forEach((row) => {
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(row.color || '#64748B')
          .text(row.label, summaryX + 12, lineY, { width: 130, align: 'left' })
          .fillColor(row.color || '#0F172A')
          .font('Helvetica-Bold')
          .text(row.value, summaryX + 140, lineY, { width: 108, align: 'right' });

        lineY += 20; // STRICT INCREMENT FOR EVERY SINGLE LINE
      });

      // Grand Total Highlight Accent Bar (#0F172A)
      const grandBarY = summaryY + summaryBoxHeight - 30;
      doc
        .rect(summaryX, grandBarY, summaryW, 30)
        .fill('#0F172A');

      const grandTextY = grandBarY + 9;
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor('#FFFFFF')
        .text('Grand Total:', summaryX + 12, grandTextY, { width: 120, align: 'left' })
        .fontSize(11)
        .text(`$${grandTotal.toFixed(2)}`, summaryX + 130, grandTextY - 1, { width: 118, align: 'right' });

      // ==========================================
      // 6. Enterprise Footer
      // ==========================================
      const footerY = 780; // Near bottom of A4 page (841.89 pt height)

      doc
        .strokeColor('#E2E8F0')
        .lineWidth(0.5)
        .moveTo(margin, footerY - 20)
        .lineTo(margin + contentWidth, footerY - 20)
        .stroke();

      doc
        .fillColor('#64748B')
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Thank you for your business!', margin, footerY - 12, { width: contentWidth, align: 'center' });

      doc
        .fillColor('#94A3B8')
        .fontSize(7.5)
        .font('Helvetica')
        .text('For order support or inquiries, contact support@devstore.com  •  DevStore Tech Inc.', margin, footerY + 2, { width: contentWidth, align: 'center' });

      doc.end();

      writeStream.on('finish', async () => {
        try {
          const relativePath = `/uploads/invoices/${fileName}`;
          const searchId = order._id ? order._id.toString() : order.orderId;
          const existingInv = await Invoice.findOne({ where: { orderId: searchId } });
          
          if (existingInv) {
            await existingInv.update({ pdfPath: relativePath, amount: grandTotal });
          } else {
            await Invoice.create({
              orderId: searchId,
              invoiceNumber: `${invoiceNum}-${Date.now().toString().slice(-4)}`,
              pdfPath: relativePath,
              amount: grandTotal
            });
          }
          resolve(relativePath);
        } catch (err) {
          console.error('Invoice DB write warning:', err.message);
          resolve(`/uploads/invoices/${fileName}`);
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
