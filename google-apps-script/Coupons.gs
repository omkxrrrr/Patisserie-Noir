/**
 * Coupons.gs
 */

function rowToCoupon_(r) {
  return {
    code: r.Code, type: r.Type, value: Number(r.Value) || 0,
    minOrderAmount: Number(r.MinOrderAmount) || 0, maxDiscount: r.MaxDiscount === '' ? null : Number(r.MaxDiscount),
    validFrom: r.ValidFrom, validTo: r.ValidTo,
    usageLimit: r.UsageLimit === '' ? null : Number(r.UsageLimit), usedCount: Number(r.UsedCount) || 0,
    isActive: toBool_(r.IsActive), tag: r.Tag
  };
}

/** Public: validate a coupon against an order amount and return the discount to apply. */
function validateCoupon_(payload) {
  const code = String(payload.code || '').trim().toUpperCase();
  const amount = Number(payload.amount) || 0;
  const coupon = readSheet_('Coupons', CACHE_TTL.LONG).find(function (c) { return String(c.Code).toUpperCase() === code; });

  if (!coupon) return fail_('Invalid coupon code.');
  if (!toBool_(coupon.IsActive)) return fail_('This coupon is no longer active.');

  const now = new Date();
  if (coupon.ValidFrom && now < new Date(coupon.ValidFrom)) return fail_('This coupon is not active yet.');
  if (coupon.ValidTo && now > new Date(coupon.ValidTo)) return fail_('This coupon has expired.');
  if (coupon.UsageLimit !== '' && Number(coupon.UsedCount) >= Number(coupon.UsageLimit)) return fail_('This coupon has reached its usage limit.');
  if (amount < Number(coupon.MinOrderAmount || 0)) {
    return fail_('Minimum order amount for this coupon is \u20B9' + coupon.MinOrderAmount + '.');
  }

  let discount = coupon.Type === 'percent' ? (amount * Number(coupon.Value) / 100) : Number(coupon.Value);
  if (coupon.MaxDiscount !== '' && discount > Number(coupon.MaxDiscount)) discount = Number(coupon.MaxDiscount);
  discount = Math.round(discount);

  return ok_({ code: coupon.Code, type: coupon.Type, discount: discount, finalAmount: Math.max(amount - discount, 0) });
}

function incrementCouponUsage_(code) {
  const coupon = readSheet_('Coupons', 0).find(function (c) { return String(c.Code).toUpperCase() === String(code).toUpperCase(); });
  if (!coupon) return;
  updateRowByKey_('Coupons', 'Code', coupon.Code, { UsedCount: (Number(coupon.UsedCount) || 0) + 1 });
}

function listCoupons_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  return ok_(readSheet_('Coupons', 0).map(rowToCoupon_));
}

function createCoupon_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const code = String(payload.code || '').trim().toUpperCase();
  if (!code || !payload.type || payload.value == null) return fail_('Code, type, and value are required.');
  appendRow_('Coupons', {
    Code: code, Type: payload.type, Value: payload.value,
    MinOrderAmount: payload.minOrderAmount || 0, MaxDiscount: payload.maxDiscount || '',
    ValidFrom: payload.validFrom || '', ValidTo: payload.validTo || '',
    UsageLimit: payload.usageLimit || '', UsedCount: 0, IsActive: true, Tag: payload.tag || ''
  });
  logAudit_(guard.session.Username, 'CREATE_COUPON', 'Coupon', code, '');
  return ok_({ code: code });
}

function setCouponActive_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const updated = updateRowByKey_('Coupons', 'Code', String(payload.code).toUpperCase(), { IsActive: !!payload.isActive });
  if (!updated) return fail_('Coupon not found.');
  return ok_(rowToCoupon_(updated));
}
