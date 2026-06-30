import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, ShoppingBag, ChefHat, Users, Package, MessageSquareText,
  Star, Tag, CakeSlice, Image, FileText, ShieldCheck, LogOut, Cake
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const NAV_GROUPS = [
  {
    heading: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, minRole: 'Staff' }]
  },
  {
    heading: 'Operations',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, minRole: 'Staff' },
      { to: '/admin/kitchen', label: 'Kitchen Queue', icon: ChefHat, minRole: 'Staff' },
      { to: '/admin/customers', label: 'Customers', icon: Users, minRole: 'Staff' },
      { to: '/admin/inventory', label: 'Inventory', icon: Package, minRole: 'Staff' },
      { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquareText, minRole: 'Staff' }
    ]
  },
  {
    heading: 'Marketing',
    items: [
      { to: '/admin/cakes', label: 'Cake Menu', icon: CakeSlice, minRole: 'Manager' },
      { to: '/admin/coupons', label: 'Coupons', icon: Tag, minRole: 'Manager' },
      { to: '/admin/testimonials', label: 'Testimonials', icon: Star, minRole: 'Staff' },
      { to: '/admin/content', label: 'Content & Blog', icon: Image, minRole: 'Manager' }
    ]
  },
  {
    heading: 'System',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: FileText, minRole: 'Manager' },
      { to: '/admin/staff', label: 'Staff & Roles', icon: ShieldCheck, minRole: 'Admin' }
    ]
  }
];

const ROLE_RANK = { Staff: 1, Manager: 2, Admin: 3, Owner: 4 };

export default function AdminSidebar() {
  const navigate = useNavigate();
  const staff = useAdminAuthStore((s) => s.staff);
  const logout = useAdminAuthStore((s) => s.logout);
  const myRank = ROLE_RANK[staff?.role] || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-cocoa-100 bg-white dark:border-cocoa-700 dark:bg-cocoa-800">
      <div className="flex items-center gap-2 px-6 py-6 font-display text-lg font-semibold text-cocoa-700 dark:text-blush">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-cocoa-700 text-blush dark:bg-mulberry-500">
          <Cake size={18} />
        </span>
        Admin Panel
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((i) => myRank >= ROLE_RANK[i.minRole]);
          if (!visibleItems.length) return null;
          return (
            <div key={group.heading} className="mb-5">
              <p className="px-3 pb-2 font-mono text-[11px] uppercase tracking-widest text-cocoa-300">{group.heading}</p>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    clsx(
                      'mb-1 flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-mulberry-50 text-mulberry-600 dark:bg-mulberry-500/15 dark:text-mulberry-300'
                        : 'text-cocoa-600 hover:bg-cocoa-50 dark:text-blush-deep dark:hover:bg-cocoa-700'
                    )
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-cocoa-100 p-4 dark:border-cocoa-700">
        <div className="mb-3 px-2 text-sm">
          <p className="font-semibold text-cocoa-700 dark:text-blush">{staff?.name}</p>
          <p className="text-xs text-cocoa-400">{staff?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-soft px-3 py-2.5 text-sm font-medium text-cocoa-500 hover:bg-cocoa-50 dark:text-blush-deep dark:hover:bg-cocoa-700"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}
