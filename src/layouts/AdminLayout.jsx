import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../components/layout/AdminSidebar';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-blush dark:bg-cocoa-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-cocoa-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-cocoa-100 bg-white px-4 dark:border-cocoa-700 dark:bg-cocoa-800 lg:hidden">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full text-cocoa-600 hover:bg-cocoa-100 dark:text-blush"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-display text-base text-cocoa-700 dark:text-blush">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
