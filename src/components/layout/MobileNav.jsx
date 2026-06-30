import { AnimatePresence, motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export default function MobileNav({ links }) {
  const isOpen = useUiStore((s) => s.isMobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-cocoa-900/50 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 h-full w-[78vw] max-w-xs bg-blush p-6 shadow-lift dark:bg-cocoa-800 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg text-cocoa-700 dark:text-blush">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-cocoa-600 hover:bg-cocoa-100 dark:text-blush dark:hover:bg-cocoa-700"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-soft px-3 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-mulberry-50 text-mulberry-600 dark:bg-mulberry-500/10 dark:text-mulberry-300'
                        : 'text-cocoa-600 hover:bg-cocoa-50 dark:text-blush-deep dark:hover:bg-cocoa-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <NavLink
              to="/cakes"
              onClick={() => setOpen(false)}
              className="mt-8 block rounded-pill bg-mulberry-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-card"
            >
              Order a Cake
            </NavLink>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
