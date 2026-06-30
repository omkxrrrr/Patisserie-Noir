/**
 * src/utils/whatsapp.js
 * No WhatsApp Business API — this builds wa.me "click to chat" links with
 * a pre-filled message. The customer or staff member taps the link/button
 * and WhatsApp opens with the message ready to send. Zero setup, zero cost.
 */

function toWhatsAppDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`; // assume India if no country code given
  return digits;
}

export function buildWhatsAppLink(phone, message) {
  const digits = toWhatsAppDigits(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}

export const whatsappTemplates = {
  orderPlaced: (order) =>
    `Hi ${order.customerName}! 🎂 Thank you for your order with ${import.meta.env.VITE_SHOP_NAME || 'us'}.\n\n` +
    `Order ID: ${order.orderId}\nCake: ${order.cakeName}\nDelivery: ${order.deliveryDate}, ${order.deliverySlot}\n` +
    `Total: ₹${order.totalAmount}\n\nWe'll confirm shortly. Reply here if you'd like to change anything!`,

  orderConfirmed: (order) =>
    `Hi ${order.customerName}, your order ${order.orderId} is confirmed! ✅ We'll start baking closer to your delivery date (${order.deliveryDate}, ${order.deliverySlot}).`,

  bakingStarted: (order) =>
    `Hi ${order.customerName}, exciting news — we've started baking your cake for order ${order.orderId}! 🧁`,

  outForDelivery: (order) =>
    `Hi ${order.customerName}, your cake for order ${order.orderId} is out for delivery and should reach you in your ${order.deliverySlot} window today. 🚚🎂`,

  delivered: (order) =>
    `Hi ${order.customerName}, we hope your cake for order ${order.orderId} arrived perfectly! Thank you for ordering with us — we'd love a review. 💛`
};
