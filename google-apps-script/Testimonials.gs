/**
 * Testimonials.gs
 */

function rowToTestimonial_(r) {
  return {
    id: r.Id, customerName: r.CustomerName, rating: Number(r.Rating) || 0, text: r.Text,
    photoUrl: r.PhotoUrl, cakeOrdered: r.CakeOrdered,
    isApproved: toBool_(r.IsApproved), isFeatured: toBool_(r.IsFeatured), createdAt: r.CreatedAt
  };
}

/** Public: anyone can submit a review, but it only appears on the site after admin approval. */
function submitTestimonial_(payload) {
  if (!payload.customerName || !payload.text || !payload.rating) {
    return fail_('Name, rating, and review text are required.');
  }
  const id = generateId_('REV');
  appendRow_('Testimonials', {
    Id: id, CustomerName: payload.customerName, Rating: payload.rating, Text: payload.text,
    PhotoUrl: payload.photoUrl || '', CakeOrdered: payload.cakeOrdered || '',
    IsApproved: false, IsFeatured: false, CreatedAt: nowIso_()
  });
  return ok_({ testimonialId: id, pendingApproval: true });
}

/** Public: only approved reviews are ever returned to the storefront. */
function getTestimonials_(payload) {
  payload = payload || {};
  let reviews = readSheet_('Testimonials', CACHE_TTL.MEDIUM).filter(function (r) { return toBool_(r.IsApproved); });
  if (payload.featuredOnly) reviews = reviews.filter(function (r) { return toBool_(r.IsFeatured); });
  reviews.sort(function (a, b) { return new Date(b.CreatedAt) - new Date(a.CreatedAt); });
  if (payload.limit) reviews = reviews.slice(0, Number(payload.limit));
  return ok_(reviews.map(rowToTestimonial_));
}

function adminListTestimonials_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  let reviews = readSheet_('Testimonials', 0);
  if (payload.pendingOnly) reviews = reviews.filter(function (r) { return !toBool_(r.IsApproved); });
  reviews.sort(function (a, b) { return new Date(b.CreatedAt) - new Date(a.CreatedAt); });
  return ok_(reviews.map(rowToTestimonial_));
}

function adminModerateTestimonial_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const patch = { UpdatedAt: nowIso_() };
  if (payload.hasOwnProperty('isApproved')) patch.IsApproved = !!payload.isApproved;
  if (payload.hasOwnProperty('isFeatured')) patch.IsFeatured = !!payload.isFeatured;
  const updated = updateRowByKey_('Testimonials', 'Id', payload.id, patch);
  if (!updated) return fail_('Testimonial not found.');
  return ok_(rowToTestimonial_(updated));
}
