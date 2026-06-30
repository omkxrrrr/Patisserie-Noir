/**
 * Orders.gs
 */

const DELIVERY_SLOTS = ['10AM-12PM', '12PM-2PM', '2PM-4PM', '4PM-6PM', '6PM-8PM'];
const DEFAULT_MAX_ORDERS_PER_SLOT = 6;

function rowToOrder_(r) {
  return {
    orderId: r.OrderId, customerName: r.CustomerName, phone: r.Phone, email: r.Email,
    address: r.Address, mapLink: r.MapLink, lat: r.Lat, lng: r.Lng,
    cakeId: r.CakeId, cakeName: r.CakeName, category: r.Category, shape: r.Shape,
    weightKg: Number(r.WeightKg) || 0, flavor: r.Flavor, creamType: r.CreamType,
    frostingType: r.FrostingType, theme: r.Theme, decorationStyle: r.DecorationStyle,
    topper: r.Topper, greetingCard: r.GreetingCard, candles: r.Candles,
    customMessage: r.CustomMessage, photoUploadUrl: r.PhotoUploadUrl, referenceImageUrl: r.ReferenceImageUrl,
    occasion: r.Occasion, deliveryDate: r.DeliveryDate, deliverySlot: r.DeliverySlot,
    specialInstructions: r.SpecialInstructions, isGift: toBool_(r.IsGift),
    recipientName: r.RecipientName, recipientPhone: r.RecipientPhone, giftMessage: r.GiftMessage,
    couponCode: r.CouponCode, basePrice: Number(r.BasePrice) || 0, addOnsPrice: Number(r.AddOnsPrice) || 0,
    deliveryCharge: Number(r.DeliveryCharge) || 0, discountAmount: Number(r.DiscountAmount) || 0,
    totalAmount: Number(r.TotalAmount) || 0, orderStatus: r.OrderStatus, paymentStatus: r.PaymentStatus,
    isVIP: toBool_(r.IsVIP), isPriority: toBool_(r.IsPriority), isDuplicateFlag: toBool_(r.IsDuplicateFlag),
    staffNotes: r.StaffNotes, source: r.Source, createdAt: r.CreatedAt, updatedAt: r.UpdatedAt
  };
}

/** Public: how many orders are already booked per slot for a given date, so the UI can disable full slots. */
function getSlotAvailability_(payload) {
  const date = payload.date;
  if (!date) return fail_('date is required (YYYY-MM-DD).');
  const props = PropertiesService.getScriptProperties();
  const maxPerSlot = Number(props.getProperty('MAX_ORDERS_PER_SLOT')) || DEFAULT_MAX_ORDERS_PER_SLOT;

  const orders = readSheet_('Orders', CACHE_TTL.SHORT).filter(function (o) {
    return o.DeliveryDate === date && o.OrderStatus !== 'Cancelled';
  });
  const counts = {};
  DELIVERY_SLOTS.forEach(function (s) { counts[s] = 0; });
  orders.forEach(function (o) { if (counts.hasOwnProperty(o.DeliverySlot)) counts[o.DeliverySlot]++; });

  const slots = DELIVERY_SLOTS.map(function (s) {
    return { slot: s, booked: counts[s], capacity: maxPerSlot, isFull: counts[s] >= maxPerSlot };
  });
  return ok_({ date: date, slots: slots });
}

/** Public: create a new order request. No payment, no login — this is purely a request capture. */
function createOrder_(payload) {
  if (!payload.customerName || !payload.phone || !payload.deliveryDate || !payload.deliverySlot) {
    return fail_('Name, phone, delivery date, and delivery slot are required.');
  }

  // Enforce slot capacity server-side too (client-side check can be raced/bypassed).
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let orderId;
  try {
    const availability = JSON.parse(getSlotAvailability_({ date: payload.deliveryDate }).getContent());
    const slotInfo = availability.data.slots.find(function (s) { return s.slot === payload.deliverySlot; });
    if (slotInfo && slotInfo.isFull) {
      return fail_('That delivery slot is fully booked. Please choose another slot.');
    }

    // Duplicate detection: same phone + same cake + same delivery date submitted recently.
    const recentOrders = readSheet_('Orders', 0).filter(function (o) {
      return o.Phone === payload.phone && o.DeliveryDate === payload.deliveryDate && o.OrderStatus !== 'Cancelled';
    });
    const isDuplicate = recentOrders.length > 0;

    orderId = generateId_('PN');
    const now = nowIso_();
    const row = {
      OrderId: orderId, CustomerName: payload.customerName, Phone: payload.phone, Email: payload.email || '',
      Address: payload.address || '', MapLink: payload.mapLink || '', Lat: payload.lat || '', Lng: payload.lng || '',
      CakeId: payload.cakeId || '', CakeName: payload.cakeName || '', Category: payload.category || '',
      Shape: payload.shape || '', WeightKg: payload.weightKg || '', Flavor: payload.flavor || '',
      CreamType: payload.creamType || '', FrostingType: payload.frostingType || '', Theme: payload.theme || '',
      DecorationStyle: payload.decorationStyle || '', Topper: payload.topper || '', GreetingCard: payload.greetingCard || '',
      Candles: payload.candles || '', CustomMessage: payload.customMessage || '',
      PhotoUploadUrl: payload.photoUploadUrl || '', ReferenceImageUrl: payload.referenceImageUrl || '',
      Occasion: payload.occasion || '', DeliveryDate: payload.deliveryDate, DeliverySlot: payload.deliverySlot,
      SpecialInstructions: payload.specialInstructions || '', IsGift: !!payload.isGift,
      RecipientName: payload.recipientName || '', RecipientPhone: payload.recipientPhone || '',
      GiftMessage: payload.giftMessage || '', CouponCode: payload.couponCode || '',
      BasePrice: payload.basePrice || 0, AddOnsPrice: payload.addOnsPrice || 0,
      DeliveryCharge: payload.deliveryCharge || 0, DiscountAmount: payload.discountAmount || 0,
      TotalAmount: payload.totalAmount || 0, OrderStatus: 'Pending', PaymentStatus: 'Pending (Manual)',
      IsVIP: false, IsPriority: false, IsDuplicateFlag: isDuplicate, StaffNotes: '',
      Source: payload.source || 'Website', CreatedAt: now, UpdatedAt: now
    };
    appendRow_('Orders', row);

    if (payload.couponCode) incrementCouponUsage_(payload.couponCode);
    upsertCustomerOnOrder_(row);

    appendRow_('StatusLog', { Id: generateId_('LOG'), OrderId: orderId, FromStatus: '', ToStatus: 'Pending', ChangedBy: 'Customer', Note: 'Order submitted', CreatedAt: now });

    return ok_({ orderId: orderId, isDuplicate: isDuplicate, createdAt: now });
  } finally {
    lock.releaseLock();
  }
}

function getOrderById_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const row = readSheet_('Orders', 0).find(function (o) { return o.OrderId === payload.orderId; });
  if (!row) return fail_('Order not found.');
  const timeline = readSheet_('StatusLog', 0).filter(function (l) { return l.OrderId === payload.orderId; });
  return ok_({ order: rowToOrder_(row), timeline: timeline });
}

/** Admin: filtered, searched, paginated order list. */
function getOrders_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;

  let orders = readSheet_('Orders', CACHE_TTL.SHORT);

  if (payload.status) orders = orders.filter(function (o) { return o.OrderStatus === payload.status; });
  if (payload.dateFrom) orders = orders.filter(function (o) { return o.DeliveryDate >= payload.dateFrom; });
  if (payload.dateTo) orders = orders.filter(function (o) { return o.DeliveryDate <= payload.dateTo; });
  if (payload.vipOnly) orders = orders.filter(function (o) { return toBool_(o.IsVIP); });
  if (payload.priorityOnly) orders = orders.filter(function (o) { return toBool_(o.IsPriority); });
  if (payload.search) {
    const q = String(payload.search).toLowerCase();
    orders = orders.filter(function (o) {
      return String(o.CustomerName).toLowerCase().indexOf(q) !== -1 ||
        String(o.Phone).indexOf(q) !== -1 ||
        String(o.OrderId).toLowerCase().indexOf(q) !== -1;
    });
  }

  orders.sort(function (a, b) { return new Date(b.CreatedAt) - new Date(a.CreatedAt); });

  const total = orders.length;
  const page = Number(payload.page) || 1;
  const pageSize = Number(payload.pageSize) || 25;
  const pageItems = orders.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map(rowToOrder_);

  return ok_({ items: pageItems, total: total, page: page, pageSize: pageSize, totalPages: Math.ceil(total / pageSize) });
}

function updateOrderStatus_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const current = readSheet_('Orders', 0).find(function (o) { return o.OrderId === payload.orderId; });
  if (!current) return fail_('Order not found.');

  const updated = updateRowByKey_('Orders', 'OrderId', payload.orderId, {
    OrderStatus: payload.status, UpdatedAt: nowIso_()
  });
  appendRow_('StatusLog', {
    Id: generateId_('LOG'), OrderId: payload.orderId, FromStatus: current.OrderStatus, ToStatus: payload.status,
    ChangedBy: guard.session.Username, Note: payload.note || '', CreatedAt: nowIso_()
  });
  logAudit_(guard.session.Username, 'UPDATE_ORDER_STATUS', 'Order', payload.orderId, current.OrderStatus + ' -> ' + payload.status);
  return ok_(rowToOrder_(updated));
}

function bulkUpdateOrderStatus_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const ids = payload.orderIds || [];
  const results = ids.map(function (id) {
    const r = updateOrderStatus_({ token: payload.token, orderId: id, status: payload.status, note: payload.note || 'Bulk update' });
    return { orderId: id, ok: JSON.parse(r.getContent()).success };
  });
  return ok_({ results: results });
}

function addOrderNote_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const updated = updateRowByKey_('Orders', 'OrderId', payload.orderId, { StaffNotes: payload.note, UpdatedAt: nowIso_() });
  if (!updated) return fail_('Order not found.');
  return ok_(rowToOrder_(updated));
}

function setOrderFlags_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const patch = { UpdatedAt: nowIso_() };
  if (payload.hasOwnProperty('isVIP')) patch.IsVIP = !!payload.isVIP;
  if (payload.hasOwnProperty('isPriority')) patch.IsPriority = !!payload.isPriority;
  const updated = updateRowByKey_('Orders', 'OrderId', payload.orderId, patch);
  if (!updated) return fail_('Order not found.');
  return ok_(rowToOrder_(updated));
}

/** Kitchen Management: today's orders + the upcoming production queue grouped by date/status. */
function getKitchenQueue_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const activeStatuses = ['Pending', 'Confirmed', 'Baking', 'Decorating', 'Ready'];
  const orders = readSheet_('Orders', CACHE_TTL.SHORT)
    .filter(function (o) { return activeStatuses.indexOf(o.OrderStatus) !== -1; })
    .sort(function (a, b) {
      if (a.DeliveryDate !== b.DeliveryDate) return a.DeliveryDate < b.DeliveryDate ? -1 : 1;
      return DELIVERY_SLOTS.indexOf(a.DeliverySlot) - DELIVERY_SLOTS.indexOf(b.DeliverySlot);
    })
    .map(rowToOrder_);

  const todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  return ok_({
    today: orders.filter(function (o) { return o.deliveryDate === todayStr; }),
    upcoming: orders.filter(function (o) { return o.deliveryDate > todayStr; }),
    byStatus: activeStatuses.reduce(function (acc, s) {
      acc[s] = orders.filter(function (o) { return o.orderStatus === s; }).length;
      return acc;
    }, {})
  });
}
