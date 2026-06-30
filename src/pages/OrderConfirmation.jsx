import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, MessageCircle, Home } from 'lucide-react';
import { generateInvoicePdf } from '../utils/pdfInvoice';
import { buildWhatsAppLink, whatsappTemplates } from '../utils/whatsapp';
import { formatCurrency, formatDate } from '../utils/format';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    if (order) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem('pn-last-order') || 'null');
      if (stored && stored.orderId === orderId) setOrder(stored);
    } catch { /* ignore */ }
  }, [order, orderId]);

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Order {orderId}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-cocoa-400">
          We couldn't find this order's details in your current browser session. If you just placed this order,
          check the WhatsApp confirmation we sent. For anything else, contact us directly with your Order ID.
        </p>
        <Link to="/cakes" className="mt-6 inline-block rounded-pill bg-mulberry-500 px-6 py-3 text-sm font-semibold text-white">Back to Cake Menu</Link>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col items-center py-16 sm:py-24">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      >
        <CheckCircle2 size={64} className="text-sage" />
      </motion.div>

      <h1 className="mt-5 text-center font-display text-display-md text-cocoa-700 dark:text-blush">Order Request Received!</h1>
      <p className="mt-2 max-w-md text-center text-sm text-cocoa-400">
        Our team will review and confirm your order shortly. Save your Order ID for reference.
      </p>

      <div className="mt-6 rounded-pill bg-cocoa-700 px-6 py-2.5 font-mono text-sm font-semibold text-white dark:bg-mulberry-500">
        {order.orderId}
      </div>

      <div className="mt-10 w-full max-w-md rounded-soft bg-white p-6 shadow-card dark:bg-cocoa-800">
        <h2 className="font-display text-base text-cocoa-700 dark:text-blush">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-cocoa-400">Cake</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{order.cakeName}</dd></div>
          <div className="flex justify-between"><dt className="text-cocoa-400">Delivery</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{formatDate(order.deliveryDate)}, {order.deliverySlot}</dd></div>
          <div className="flex justify-between"><dt className="text-cocoa-400">Address</dt><dd className="max-w-[60%] text-right font-medium text-cocoa-700 dark:text-blush">{order.address}</dd></div>
          <div className="flex justify-between border-t border-cocoa-100 pt-2 dark:border-cocoa-700"><dt className="font-semibold text-cocoa-700 dark:text-blush">Total</dt><dd className="font-display text-lg text-mulberry-600 dark:text-mulberry-300">{formatCurrency(order.totalAmount)}</dd></div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => generateInvoicePdf(order)}
          className="flex items-center gap-2 rounded-pill border border-cocoa-200 px-5 py-2.5 text-sm font-semibold text-cocoa-700 dark:border-cocoa-600 dark:text-blush"
        >
          <Download size={16} /> Download Receipt
        </button>
        <a
          href={buildWhatsAppLink(order.phone, whatsappTemplates.orderPlaced(order))}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 rounded-pill bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <MessageCircle size={16} /> Confirm on WhatsApp
        </a>
      </div>

      <Link to="/" className="mt-10 flex items-center gap-1.5 text-sm font-medium text-cocoa-400 hover:text-mulberry-500">
        <Home size={14} /> Back to homepage
      </Link>
    </div>
  );
}
