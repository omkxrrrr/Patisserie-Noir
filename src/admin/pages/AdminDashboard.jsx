import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, IndianRupee, Users, Crown, ArrowRight, BarChart3
} from 'lucide-react';
import { analyticsService } from '../../services/adminServices';
import { SkeletonBlock } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/format';

function StatCard({ icon: Icon, label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white dark:bg-cocoa-800',
    mulberry: 'bg-mulberry-50 dark:bg-mulberry-500/10',
    gold: 'bg-gilt-100 dark:bg-gilt/10'
  };
  return (
    <div className={`rounded-soft p-5 shadow-card ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">{label}</span>
        <Icon size={16} className="text-cocoa-300" />
      </div>
      <p className="mt-2 font-display text-2xl text-cocoa-700 dark:text-blush">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([analyticsService.dashboardSummary(), analyticsService.revenueSeries(14)])
      .then(([s, r]) => { if (!cancelled) { setSummary(s); setSeries(r); } })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Overview</p>
          <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Dashboard</h1>
        </div>
        <Link to="/admin/analytics" className="flex items-center gap-1.5 text-sm font-semibold text-mulberry-500">
          <BarChart3 size={15} /> Full Analytics <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={summary.counts.total} />
        <StatCard icon={Clock} label="Pending" value={summary.counts.pending} tone="gold" />
        <StatCard icon={CheckCircle2} label="Completed" value={summary.counts.completed} />
        <StatCard icon={XCircle} label="Cancelled" value={summary.counts.cancelled} />
        <StatCard icon={ShoppingBag} label="Today's Orders" value={summary.counts.today} tone="mulberry" />
        <StatCard icon={ShoppingBag} label="Upcoming" value={summary.counts.upcoming} />
        <StatCard icon={IndianRupee} label="Revenue (Est.)" value={formatCurrency(summary.revenueEstimate)} tone="gold" />
        <StatCard icon={Users} label="Customers" value={summary.customerCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <h2 className="font-display text-base text-cocoa-700 dark:text-blush">Revenue — Last 14 Days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8C2F4B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8C2F4B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD9C9" />
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(d) => formatDate(d)} />
                <Area type="monotone" dataKey="revenue" stroke="#8C2F4B" fill="url(#revFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <h2 className="flex items-center gap-2 font-display text-base text-cocoa-700 dark:text-blush">
            <Crown size={16} className="text-gilt" /> Most Ordered Cakes
          </h2>
          <ul className="mt-4 space-y-3">
            {summary.topCakes.length === 0 && <p className="text-sm text-cocoa-400">No orders yet.</p>}
            {summary.topCakes.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-cocoa-600 dark:text-blush-deep">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-cocoa-100 text-xs font-bold text-cocoa-500 dark:bg-cocoa-700">{i + 1}</span>
                  {c.name}
                </span>
                <span className="font-semibold text-cocoa-700 dark:text-blush">{c.count}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-cocoa-100 pt-4 text-sm dark:border-cocoa-700">
            <div className="flex justify-between text-cocoa-500"><span>VIP Customers</span><span className="font-semibold text-cocoa-700 dark:text-blush">{summary.vipCustomerCount}</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/orders?status=Pending" className="rounded-pill bg-mulberry-500 px-5 py-2.5 text-sm font-semibold text-white">Review Pending Orders</Link>
        <Link to="/admin/kitchen" className="rounded-pill border border-cocoa-200 px-5 py-2.5 text-sm font-semibold text-cocoa-600 dark:border-cocoa-600 dark:text-blush-deep">Today's Kitchen Queue</Link>
      </div>
    </div>
  );
}
