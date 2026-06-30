import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Loader2, Users, Crown } from 'lucide-react';
import { analyticsService } from '../../services/adminServices';
import { formatCurrency, formatDate } from '../../utils/format';

const RANGE_TABS = [
  { id: 'daily', label: 'Daily', days: 14, bucket: 'day' },
  { id: 'weekly', label: 'Weekly', days: 90, bucket: 'week' },
  { id: 'monthly', label: 'Monthly', days: 365, bucket: 'month' }
];

const STATUS_COLORS = {
  pending: '#C9952B', confirmed: '#5F7355', completed: '#8C2F4B', cancelled: '#B23A48'
};

function isoWeekKey(dateStr) {
  const d = new Date(dateStr);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function aggregate(series, bucket) {
  if (bucket === 'day') return series.map((s) => ({ label: s.date, revenue: s.revenue }));
  const groups = {};
  series.forEach((s) => {
    const key = bucket === 'week' ? isoWeekKey(s.date) : s.date.slice(0, 7);
    groups[key] = (groups[key] || 0) + s.revenue;
  });
  return Object.keys(groups).sort().map((key) => ({ label: key, revenue: groups[key] }));
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [seriesCache, setSeriesCache] = useState({});
  const [activeTab, setActiveTab] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeriesLoading, setIsSeriesLoading] = useState(false);

  useEffect(() => {
    analyticsService.dashboardSummary()
      .then(setSummary)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const tab = RANGE_TABS.find((t) => t.id === activeTab);
    if (seriesCache[tab.days]) return;
    setIsSeriesLoading(true);
    analyticsService.revenueSeries(tab.days)
      .then((data) => setSeriesCache((prev) => ({ ...prev, [tab.days]: data })))
      .catch((err) => toast.error(err.message))
      .finally(() => setIsSeriesLoading(false));
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTabDef = RANGE_TABS.find((t) => t.id === activeTab);
  const chartData = useMemo(() => {
    const raw = seriesCache[activeTabDef.days];
    return raw ? aggregate(raw, activeTabDef.bucket) : [];
  }, [seriesCache, activeTabDef]);

  const statusPieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Pending', value: summary.counts.pending, key: 'pending' },
      { name: 'Confirmed', value: summary.counts.confirmed, key: 'confirmed' },
      { name: 'Completed', value: summary.counts.completed, key: 'completed' },
      { name: 'Cancelled', value: summary.counts.cancelled, key: 'cancelled' }
    ].filter((d) => d.value > 0);
  }, [summary]);

  if (isLoading || !summary) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-mulberry-500" size={28} /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-1">Insights</p>
        <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">Total Orders</p>
          <p className="mt-2 font-display text-2xl text-cocoa-700 dark:text-blush">{summary.counts.total}</p>
        </div>
        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-400">Revenue (Est.)</p>
          <p className="mt-2 font-display text-2xl text-cocoa-700 dark:text-blush">{formatCurrency(summary.revenueEstimate)}</p>
        </div>
        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cocoa-400"><Users size={13} /> Customers</p>
          <p className="mt-2 font-display text-2xl text-cocoa-700 dark:text-blush">{summary.customerCount}</p>
        </div>
        <div className="rounded-soft bg-gilt-100 p-5 shadow-card">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cocoa-500"><Crown size={13} /> VIP Customers</p>
          <p className="mt-2 font-display text-2xl text-cocoa-700">{summary.vipCustomerCount}</p>
        </div>
      </div>

      <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base text-cocoa-700 dark:text-blush">Revenue</h2>
          <div className="flex gap-1.5 rounded-pill bg-cocoa-50 p-1 dark:bg-cocoa-700">
            {RANGE_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeTab === t.id ? 'bg-mulberry-500 text-white' : 'text-cocoa-500 dark:text-blush-deep'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          {isSeriesLoading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-mulberry-500" /></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="analyticsRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8C2F4B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8C2F4B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD9C9" />
                <XAxis
                  dataKey="label" tick={{ fontSize: 11 }}
                  tickFormatter={(v) => (activeTab === 'daily' ? formatDate(v, { day: 'numeric', month: 'short' }) : v)}
                />
                <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#8C2F4B" fill="url(#analyticsRevFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <h2 className="font-display text-base text-cocoa-700 dark:text-blush">Order Status Breakdown</h2>
          <div className="h-64">
            {statusPieData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-cocoa-400">No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {statusPieData.map((entry) => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
          <h2 className="font-display text-base text-cocoa-700 dark:text-blush">Most Ordered Cakes</h2>
          <div className="h-64">
            {summary.topCakes.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-cocoa-400">No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.topCakes} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAD9C9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C9952B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
