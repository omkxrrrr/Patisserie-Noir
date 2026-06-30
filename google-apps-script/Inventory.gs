/**
 * Inventory.gs
 */

function rowToInventoryItem_(r) {
  return {
    itemId: r.ItemId, itemName: r.ItemName, unit: r.Unit, currentStock: Number(r.CurrentStock) || 0,
    lowStockThreshold: Number(r.LowStockThreshold) || 0, usagePerKgCake: Number(r.UsagePerKgCake) || 0,
    lastRestockedAt: r.LastRestockedAt, notes: r.Notes,
    isLow: (Number(r.CurrentStock) || 0) <= (Number(r.LowStockThreshold) || 0)
  };
}

function getInventory_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  let items = readSheet_('Inventory', CACHE_TTL.SHORT).map(rowToInventoryItem_);
  if (payload.lowStockOnly) items = items.filter(function (i) { return i.isLow; });
  return ok_(items);
}

function adjustInventoryStock_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const item = readSheet_('Inventory', 0).find(function (i) { return i.ItemId === payload.itemId; });
  if (!item) return fail_('Inventory item not found.');

  const delta = Number(payload.delta) || 0; // positive = restock, negative = usage
  const newStock = Math.max(0, (Number(item.CurrentStock) || 0) + delta);
  const patch = { CurrentStock: newStock, UpdatedAt: nowIso_() };
  if (delta > 0) patch.LastRestockedAt = nowIso_();

  const updated = updateRowByKey_('Inventory', 'ItemId', payload.itemId, patch);
  logAudit_(guard.session.Username, 'ADJUST_STOCK', 'Inventory', payload.itemId, 'delta=' + delta);
  return ok_(rowToInventoryItem_(updated));
}

/**
 * Rough ingredient requirement estimate for upcoming (unbaked) orders:
 * sums ordered weight in kg across active orders, multiplies by each
 * item's UsagePerKgCake. This is intentionally simple — a real recipe
 * engine is out of scope, but this gives the kitchen a directional
 * "do we have enough flour for what's booked" view.
 */
function estimateIngredientNeeds_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const activeStatuses = ['Pending', 'Confirmed', 'Baking', 'Decorating'];
  const orders = readSheet_('Orders', CACHE_TTL.SHORT).filter(function (o) { return activeStatuses.indexOf(o.OrderStatus) !== -1; });
  const totalKg = orders.reduce(function (sum, o) { return sum + (Number(o.WeightKg) || 0); }, 0);

  const items = readSheet_('Inventory', CACHE_TTL.SHORT).map(function (r) {
    const needed = Math.round(totalKg * (Number(r.UsagePerKgCake) || 0) * 100) / 100;
    const stock = Number(r.CurrentStock) || 0;
    return {
      itemId: r.ItemId, itemName: r.ItemName, unit: r.Unit,
      currentStock: stock, estimatedNeed: needed, shortfall: Math.max(0, needed - stock)
    };
  });

  return ok_({ upcomingCakeKg: totalKg, items: items });
}
