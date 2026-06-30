import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Cake, Lock } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAdminAuthStore((s) => s.login);
  const isLoading = useAdminAuthStore((s) => s.isLoading);
  const error = useAdminAuthStore((s) => s.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush px-4 dark:bg-cocoa-900">
      <div className="w-full max-w-sm rounded-soft bg-white p-8 shadow-lift dark:bg-cocoa-800">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-cocoa-700 text-blush dark:bg-mulberry-500">
            <Cake size={22} />
          </span>
          <h1 className="mt-3 font-display text-xl text-cocoa-700 dark:text-blush">Admin Panel</h1>
          <p className="text-xs text-cocoa-400">{import.meta.env.VITE_SHOP_NAME || 'Patisserie Noir'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Username</label>
            <input
              value={username} onChange={(e) => setUsername(e.target.value)} autoFocus
              className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit" disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-mulberry-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            Log In
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs text-cocoa-400 hover:text-mulberry-500">← Back to the website</Link>
      </div>
    </div>
  );
}
