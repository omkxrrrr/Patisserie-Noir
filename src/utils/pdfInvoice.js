import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './format';

const SHOP_NAME = import.meta.env.VITE_SHOP_NAME || 'Patisserie Noir';
const SHOP_PHONE = import.meta.env.VITE_SHOP_PHONE || '';
const SHOP_EMAIL = import.meta.env.VITE_SHOP_EMAIL || '';
const SHOP_ADDRESS = import.meta.env.VITE_SHOP_ADDRESS || '';
const SHOP_GST = import.meta.env.VITE_SHOP_GST_NUMBER || '';

/**
 * Generates a clean, printable invoice for a single order.
 * @param {object} order
 * @param {{ isGstInvoice?: boolean, download?: boolean }} opts
 * @returns {jsPDF} the document (already saved to disk if download !== false)
 */
export function generateInvoicePdf(order, opts = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  // Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(58, 27, 20); // cocoa-700
  doc.text(SHOP_NAME, marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 90, 85);
  y += 18;
  if (SHOP_ADDRESS) { doc.text(SHOP_ADDRESS, marginX, y); y += 12; }
  const contactLine = [SHOP_PHONE, SHOP_EMAIL].filter(Boolean).join('  •  ');
  if (contactLine) { doc.text(contactLine, marginX, y); y += 12; }
  if (opts.isGstInvoice && SHOP_GST) { doc.text(`GSTIN: ${SHOP_GST}`, marginX, y); y += 12; }

  // Title + order meta
  y += 18;
  doc.setDrawColor(234, 217, 201);
  doc.line(marginX, y, 547, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(140, 47, 75); // mulberry-500
  doc.text(opts.isGstInvoice ? 'TAX INVOICE' : 'ORDER RECEIPT', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(58, 27, 20);
  doc.text(`Order ID: ${order.orderId}`, 547, y - 12, { align: 'right' });
  doc.text(`Date: ${formatDate(order.createdAt || new Date())}`, 547, y + 2, { align: 'right' });

  y += 28;

  // Bill to
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To', marginX, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || '', marginX, y); y += 12;
  doc.text(order.phone || '', marginX, y); y += 12;
  if (order.address) {
    const lines = doc.splitTextToSize(order.address, 260);
    doc.text(lines, marginX, y);
    y += lines.length * 12;
  }

  y += 12;

  // Line items
  const rows = [
    ['Cake', `${order.cakeName || ''} (${order.weightKg || ''}kg, ${order.flavor || ''})`, formatCurrency(order.basePrice)]
  ];
  if (order.addOnsPrice) rows.push(['Customization / Add-ons', '—', formatCurrency(order.addOnsPrice)]);
  if (order.deliveryCharge) rows.push(['Delivery Charge', '—', formatCurrency(order.deliveryCharge)]);
  if (order.discountAmount) rows.push(['Discount' + (order.couponCode ? ` (${order.couponCode})` : ''), '—', `-${formatCurrency(order.discountAmount)}`]);

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: 48 },
    head: [['Item', 'Details', 'Amount']],
    body: rows,
    theme: 'plain',
    styles: { fontSize: 10, textColor: [58, 27, 20], cellPadding: { top: 6, bottom: 6 } },
    headStyles: { fontStyle: 'bold', textColor: [140, 47, 75], lineWidth: { bottom: 1 }, lineColor: [234, 217, 201] },
    columnStyles: { 2: { halign: 'right' } }
  });

  let finalY = doc.lastAutoTable.finalY + 16;
  doc.setDrawColor(234, 217, 201);
  doc.line(360, finalY, 547, finalY);
  finalY += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total', 420, finalY);
  doc.text(formatCurrency(order.totalAmount), 547, finalY, { align: 'right' });

  finalY += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 105);
  doc.text('Payment & delivery are handled directly by the bakery team — this is a confirmation of your order request, not a payment receipt.', marginX, finalY, { maxWidth: 499 });

  if (opts.download !== false) {
    doc.save(`${SHOP_NAME.replace(/\s+/g, '-')}-Invoice-${order.orderId}.pdf`);
  }
  return doc;
}
