import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from './AdminRoute';
import ComingSoon from '../components/shared/ComingSoon';

const Home = lazy(() => import('../pages/Home'));
const CakeCatalog = lazy(() => import('../pages/CakeCatalog'));
const CakeDetail = lazy(() => import('../pages/CakeDetail'));
const OrderForm = lazy(() => import('../pages/OrderForm'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogPost = lazy(() => import('../pages/BlogPost'));

const AdminLogin = lazy(() => import('../admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('../admin/pages/AdminDashboard'));
const OrdersPage = lazy(() => import('../admin/pages/OrdersPage'));
const CustomerManagement = lazy(() => import('../admin/pages/CustomerManagement'));
const AnalyticsPage = lazy(() => import('../admin/pages/AnalyticsPage'));
const CakeManagement = lazy(() => import('../admin/pages/CakeManagement'));
const Content = lazy(() => import('../admin/pages/Content'));

function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-2">404</p>
      <h1 className="font-display text-display-md text-cocoa-700 dark:text-blush">This page doesn't exist</h1>
      <p className="mt-3 max-w-sm text-sm text-cocoa-400">
        The page you're looking for may have moved or never existed. Let's get you back on track.
      </p>
      <a href="/" className="mt-6 inline-block rounded-pill bg-mulberry-500 px-6 py-3 text-sm font-semibold text-white">
        Back to Homepage
      </a>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ───────── Public site ───────── */}
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="cakes" element={<CakeCatalog />} />
        <Route path="cakes/:slug" element={<CakeDetail />} />
        <Route path="order" element={<OrderForm />} />
        <Route path="order/confirmation/:orderId" element={<OrderConfirmation />} />

        <Route
          path="custom-orders"
          element={<ComingSoon title="Custom Orders" description="Wedding, corporate, and bespoke cake inquiry forms are launching here soon. Reach out via WhatsApp or Contact in the meantime." />}
        />
        <Route
          path="custom-orders/:type"
          element={<ComingSoon title="Custom Order Inquiry" description="This inquiry form type is coming soon." />}
        />
        <Route
          path="contact"
          element={<ComingSoon title="Contact Us" description="A dedicated contact form is on the way — for now, reach us directly on WhatsApp using the button in the corner." />}
        />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route
          path="occasions/:occasionId"
          element={<ComingSoon title="Occasion Picks" description="Curated cake picks for this occasion are coming soon — browse the full Cake Menu in the meantime." />}
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ───────── Admin: login (outside the dashboard shell) ───────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ───────── Admin: dashboard shell ───────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route element={<AdminRoute minRole="Staff" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route
            path="kitchen"
            element={<ComingSoon title="Kitchen Queue" description="Today's orders, the baking schedule, and prep status are coming in the next build phase." />}
          />
          <Route
            path="inventory"
            element={<ComingSoon title="Inventory" description="Ingredient stock levels, low-stock alerts, and usage estimates are coming soon." />}
          />
          <Route
            path="inquiries"
            element={<ComingSoon title="Inquiries" description="Custom, wedding, and corporate inquiry management is coming soon." />}
          />
          <Route
            path="testimonials"
            element={<ComingSoon title="Testimonials" description="Review moderation and featuring is coming soon." />}
          />
        </Route>

        <Route element={<AdminRoute minRole="Manager" />}>
          <Route path="cakes" element={<CakeManagement />} />
          <Route
            path="coupons"
            element={<ComingSoon title="Coupons" description="Coupon creation and management is coming soon." />}
          />
          <Route path="content" element={<Content />} />
          <Route
            path="reports"
            element={<ComingSoon title="Reports" description="A consolidated CSV / Excel / PDF export hub is coming soon." />}
          />
        </Route>

        <Route element={<AdminRoute minRole="Admin" />}>
          <Route
            path="staff"
            element={<ComingSoon title="Staff & Roles" description="Staff account creation and role management is coming soon." />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
