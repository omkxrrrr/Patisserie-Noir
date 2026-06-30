import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function AdminRoute({ minRole = 'Staff' }) {
  const location = useLocation();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated());
  const hasRole = useAdminAuthStore((s) => s.hasRole(minRole));

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  if (!hasRole) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-cocoa-700">You don't have access to this page</h1>
        <p className="mt-2 text-cocoa-400">Ask an Owner or Admin to grant you the right role.</p>
      </div>
    );
  }
  return <Outlet />;
}
