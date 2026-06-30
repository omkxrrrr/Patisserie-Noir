import { Link } from 'react-router-dom';
import { Instagram, Phone, Mail, MapPin, Cake } from 'lucide-react';

const SHOP_NAME = import.meta.env.VITE_SHOP_NAME || 'Patisserie Noir';
const SHOP_PHONE = import.meta.env.VITE_SHOP_PHONE || '';
const SHOP_EMAIL = import.meta.env.VITE_SHOP_EMAIL || '';
const SHOP_ADDRESS = import.meta.env.VITE_SHOP_ADDRESS || '';
const SHOP_INSTAGRAM = import.meta.env.VITE_SHOP_INSTAGRAM_HANDLE || '';

const FOOTER_LINKS = [
  {
    heading: 'Shop',
    links: [
      { to: '/cakes', label: 'Cake Menu' },
      { to: '/cakes?category=Birthday+Cakes', label: 'Birthday Cakes' },
      { to: '/cakes?category=Wedding+Cakes', label: 'Wedding Cakes' },
      { to: '/cakes?category=Photo+Cakes', label: 'Photo Cakes' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { to: '/custom-orders', label: 'Custom Orders' },
      { to: '/blog', label: 'Cake Journal' },
      { to: '/contact', label: 'Contact Us' }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cocoa-100 bg-cocoa-700 text-blush-deep dark:border-cocoa-700 dark:bg-cocoa-900">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-semibold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-mulberry-500">
              <Cake size={18} />
            </span>
            {SHOP_NAME}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-blush-deep/80">
            Every cake is baked fresh and built to order — no shortcuts, no mixes off a shelf.
            Tell us the occasion, pick your flavours, and we'll handle the rest.
          </p>
          <div className="mt-6 flex gap-3">
            {SHOP_INSTAGRAM && (
              <a
                href={`https://instagram.com/${SHOP_INSTAGRAM}`}
                target="_blank" rel="noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-mulberry-500"
              >
                <Instagram size={16} />
              </a>
            )}
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.heading}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-gilt-300">{group.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-blush-deep/85 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-gilt-300">Visit / Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-blush-deep/85">
            {SHOP_ADDRESS && (
              <li className="flex gap-2"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-gilt-300" /> {SHOP_ADDRESS}</li>
            )}
            {SHOP_PHONE && (
              <li className="flex gap-2"><Phone size={16} className="mt-0.5 flex-shrink-0 text-gilt-300" /> {SHOP_PHONE}</li>
            )}
            {SHOP_EMAIL && (
              <li className="flex gap-2"><Mail size={16} className="mt-0.5 flex-shrink-0 text-gilt-300" /> {SHOP_EMAIL}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-blush-deep/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SHOP_NAME}. All cakes baked with love.</p>
        <p>Orders are confirmed manually by our team — payment & delivery are arranged directly with you.</p>
      </div>
    </footer>
  );
}
