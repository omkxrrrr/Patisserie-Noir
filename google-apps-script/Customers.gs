/**
 * Customers.gs
 * There is no customer login/account system. This sheet is purely an
 * admin-side rollup — "who has ordered before, how much have they spent,
 * are they VIP" — built automatically every time an order is placed.
 */

function rowToCustomer_(r) {
  return {
    phone: r.Phone, name: r.Name, email: r.Email,
    totalOrders: Number(r.TotalOrders) || 0, lifetimeSpend: Number(r.LifetimeSpend) || 0,
    firstOrderAt: r.FirstOrderAt, lastOrderAt: r.LastOrderAt,
    isVIP: toBool_(r.IsVIP), notes: r.Notes, updatedAt: r.UpdatedAt
  };
}

function upsertCustomerOnOrder_(orderRow) {
  const existing = readSheet_('Customers', 0).find(function (c) { return c.Phone === orderRow.Phone; });
  const now = nowIso_();
  if (!existing) {
    appendRow_('Customers', {
      Phone: orderRow.Phone, Name: orderRow.CustomerName, Email: orderRow.Email || '',
      TotalOrders: 1, LifetimeSpend: orderRow.TotalAmount || 0,
      FirstOrderAt: now, LastOrderAt: now, IsVIP: false, Notes: '', UpdatedAt: now
    });
    return;
  }
  updateRowByKey_('Customers', 'Phone', orderRow.Phone, {
    Name: orderRow.CustomerName || existing.Name,
    Email: orderRow.Email || existing.Email,
    TotalOrders: (Number(existing.TotalOrders) || 0) + 1,
    LifetimeSpend: (Number(existing.LifetimeSpend) || 0) + (Number(orderRow.TotalAmount) || 0),
    LastOrderAt: now,
    UpdatedAt: now
  });
}

function listCustomers_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  let customers = readSheet_('Customers', CACHE_TTL.SHORT);

  if (payload.vipOnly) customers = customers.filter(function (c) { return toBool_(c.IsVIP); });
  if (payload.search) {
    const q = String(payload.search).toLowerCase();
    customers = customers.filter(function (c) {
      return String(c.Name).toLowerCase().indexOf(q) !== -1 || String(c.Phone).indexOf(q) !== -1;
    });
  }
  customers.sort(function (a, b) { return (Number(b.LifetimeSpend) || 0) - (Number(a.LifetimeSpend) || 0); });

  return ok_(customers.map(rowToCustomer_));
}

function getCustomerOrderHistory_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const orders = readSheet_('Orders', 0).filter(function (o) { return o.Phone === payload.phone; });
  return ok_(orders.map(rowToOrder_));
}

function updateCustomerNotesOrVIP_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const patch = { UpdatedAt: nowIso_() };
  if (payload.hasOwnProperty('notes')) patch.Notes = payload.notes;
  if (payload.hasOwnProperty('isVIP')) patch.IsVIP = !!payload.isVIP;
  const updated = updateRowByKey_('Customers', 'Phone', payload.phone, patch);
  if (!updated) return fail_('Customer not found.');
  return ok_(rowToCustomer_(updated));
}
