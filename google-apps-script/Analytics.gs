/**
 * Analytics.gs
 */

function getDashboardSummary_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;

  const orders = readSheet_('Orders', CACHE_TTL.SHORT);
  const todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');

  const counts = { total: orders.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0, today: 0, upcoming: 0 };
  let revenue = 0;
  const cakeFrequency = {};

  orders.forEach(function (o) {
    if (o.OrderStatus === 'Pending') counts.pending++;
    if (o.OrderStatus === 'Confirmed') counts.confirmed++;
    if (o.OrderStatus === 'Completed' || o.OrderStatus === 'Delivered') counts.completed++;
    if (o.OrderStatus === 'Cancelled') counts.cancelled++;
    if (o.DeliveryDate === todayStr) counts.today++;
    if (o.DeliveryDate > todayStr) counts.upcoming++;
    if (o.OrderStatus !== 'Cancelled') {
      revenue += Number(o.TotalAmount) || 0;
      if (o.CakeName) cakeFrequency[o.CakeName] = (cakeFrequency[o.CakeName] || 0) + 1;
    }
  });

  const topCakes = Object.keys(cakeFrequency)
    .map(function (name) { return { name: name, count: cakeFrequency[name] }; })
    .sort(function (a, b) { return b.count - a.count; })
    .slice(0, 5);

  const customers = readSheet_('Customers', CACHE_TTL.MEDIUM);

  return ok_({
    counts: counts,
    revenueEstimate: revenue,
    customerCount: customers.length,
    vipCustomerCount: customers.filter(function (c) { return toBool_(c.IsVIP); }).length,
    topCakes: topCakes
  });
}

/** Revenue grouped by day for the trailing N days (default 30) — feeds the admin revenue chart. */
function getRevenueSeries_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const days = Number(payload.days) || 30;
  const orders = readSheet_('Orders', CACHE_TTL.MEDIUM).filter(function (o) { return o.OrderStatus !== 'Cancelled'; });

  const series = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = Utilities.formatDate(d, 'Asia/Kolkata', 'yyyy-MM-dd');
    series[key] = 0;
  }
  orders.forEach(function (o) {
    const key = String(o.CreatedAt).slice(0, 10);
    if (series.hasOwnProperty(key)) series[key] += Number(o.TotalAmount) || 0;
  });

  return ok_(Object.keys(series).map(function (date) { return { date: date, revenue: series[date] }; }));
}
