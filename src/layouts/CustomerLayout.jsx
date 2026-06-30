import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { buildWhatsAppLink } from '../utils/whatsapp';

const SHOP_WHATSAPP = import.meta.env.VITE_SHOP_WHATSAPP_NUMBER || '';

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-blush dark:bg-cocoa-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {SHOP_WHATSAPP && (
        <a
          href={buildWhatsAppLink(SHOP_WHATSAPP, "Hi! I'd like to ask about ordering a cake.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-105"
        >
          <MessageCircle size={26} />
        </a>
      )}
    </div>
  );
}
