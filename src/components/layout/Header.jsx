import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, Cake } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import MobileNav from './MobileNav';

const NAV_LINKS = [
  { to: '/cakes', label: 'Cake Menu' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/blog', label: 'Cake Journal' },
  { to: '/contact', label: 'Contact' }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const isDarkMode = useUiStore((s) => s.isDarkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-blush/90 shadow-sm backdrop-blur-md dark:bg-cocoa-900/90'
            : 'bg-transparent'
        }`}
      >
        <div className="container-page flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-cocoa-700 dark:text-blush">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cocoa-700 text-blush dark:bg-mulberry-500">
              <Cake size={18} />
            </span>
            {import.meta.env.VITE_SHOP_NAME || 'Patisserie Noir'}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors hover:text-mulberry-500 ${
                    isActive ? 'text-mulberry-500' : 'text-cocoa-600 dark:text-blush-deep'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="grid h-9 w-9 place-items-center rounded-full text-cocoa-600 transition-colors hover:bg-cocoa-100 dark:text-blush dark:hover:bg-cocoa-800"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/cakes"
              className="hidden rounded-pill bg-mulberry-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:scale-[1.03] hover:bg-mulberry-600 sm:inline-block"
            >
              Order a Cake
            </Link>
            <button
              onClick={toggleMobileNav}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-full text-cocoa-600 hover:bg-cocoa-100 dark:text-blush dark:hover:bg-cocoa-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileNav links={NAV_LINKS} />
    </>
  );
}
