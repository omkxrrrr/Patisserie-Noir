/**
 * Cakes.gs
 */

function rowToCake_(r) {
  return {
    id: r.Id,
    name: r.Name,
    slug: r.Slug,
    category: r.Category,
    description: r.Description,
    basePrice: Number(r.BasePrice) || 0,
    images: String(r.Images || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    rating: Number(r.Rating) || 0,
    ratingCount: Number(r.RatingCount) || 0,
    isFeatured: toBool_(r.IsFeatured),
    isBestSeller: toBool_(r.IsBestSeller),
    isTrending: toBool_(r.IsTrending),
    isAvailable: toBool_(r.IsAvailable),
    isSeasonal: toBool_(r.IsSeasonal),
    availableFrom: r.AvailableFrom || '',
    availableTo: r.AvailableTo || '',
    tags: String(r.Tags || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    updatedAt: r.UpdatedAt
  };
}

/** Public: list cakes with optional filters. Cached for CACHE_TTL.MEDIUM since the catalog changes rarely. */
function getCakes_(payload) {
  payload = payload || {};
  let cakes = readSheet_('Cakes', CACHE_TTL.MEDIUM).map(rowToCake_);

  if (payload.category) {
    cakes = cakes.filter(function (c) { return c.category === payload.category; });
  }
  if (payload.search) {
    const q = String(payload.search).toLowerCase();
    cakes = cakes.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 || c.description.toLowerCase().indexOf(q) !== -1 ||
        c.tags.join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }
  if (payload.onlyAvailable !== false) {
    cakes = cakes.filter(function (c) { return c.isAvailable; });
  }
  if (payload.featured) cakes = cakes.filter(function (c) { return c.isFeatured; });
  if (payload.bestSeller) cakes = cakes.filter(function (c) { return c.isBestSeller; });
  if (payload.trending) cakes = cakes.filter(function (c) { return c.isTrending; });

  const sort = payload.sort || 'popularity';
  if (sort === 'price_asc') cakes.sort(function (a, b) { return a.basePrice - b.basePrice; });
  else if (sort === 'price_desc') cakes.sort(function (a, b) { return b.basePrice - a.basePrice; });
  else if (sort === 'rating') cakes.sort(function (a, b) { return b.rating - a.rating; });
  else cakes.sort(function (a, b) { return (b.ratingCount * b.rating) - (a.ratingCount * a.rating); });

  const page = Number(payload.page) || 1;
  const pageSize = Number(payload.pageSize) || 12;
  const total = cakes.length;
  const start = (page - 1) * pageSize;
  const pageItems = cakes.slice(start, start + pageSize);

  return ok_({ items: pageItems, total: total, page: page, pageSize: pageSize, totalPages: Math.ceil(total / pageSize) });
}

function getCakeById_(payload) {
  const row = readSheet_('Cakes', CACHE_TTL.MEDIUM).find(function (r) { return r.Id === payload.id || r.Slug === payload.id; });
  if (!row) return fail_('Cake not found.');
  return ok_(rowToCake_(row));
}

function getCategories_() {
  const cakes = readSheet_('Cakes', CACHE_TTL.MEDIUM);
  const counts = {};
  cakes.forEach(function (r) {
    if (!toBool_(r.IsAvailable)) return;
    counts[r.Category] = (counts[r.Category] || 0) + 1;
  });
  return ok_(Object.keys(counts).map(function (c) { return { category: c, count: counts[c] }; }));
}

// ── Admin ──────────────────────────────────────────────────────────

function adminCreateCake_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const id = generateId_('CAKE');
  const row = {
    Id: id,
    Name: payload.name,
    Slug: (payload.slug || payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    Category: payload.category,
    Description: payload.description || '',
    BasePrice: Number(payload.basePrice) || 0,
    Images: Array.isArray(payload.images) ? payload.images.join(',') : (payload.images || ''),
    Rating: 0,
    RatingCount: 0,
    IsFeatured: !!payload.isFeatured,
    IsBestSeller: !!payload.isBestSeller,
    IsTrending: !!payload.isTrending,
    IsAvailable: payload.isAvailable !== false,
    IsSeasonal: !!payload.isSeasonal,
    AvailableFrom: payload.availableFrom || '',
    AvailableTo: payload.availableTo || '',
    Tags: Array.isArray(payload.tags) ? payload.tags.join(',') : (payload.tags || ''),
    CreatedAt: nowIso_(),
    UpdatedAt: nowIso_()
  };
  appendRow_('Cakes', row);
  logAudit_(guard.session.Username, 'CREATE_CAKE', 'Cake', id, payload.name);
  return ok_(rowToCake_(row));
}

function adminUpdateCake_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const patch = { UpdatedAt: nowIso_() };
  const fieldMap = {
    name: 'Name', category: 'Category', description: 'Description', basePrice: 'BasePrice',
    rating: 'Rating', ratingCount: 'RatingCount', isFeatured: 'IsFeatured', isBestSeller: 'IsBestSeller',
    isTrending: 'IsTrending', isAvailable: 'IsAvailable', isSeasonal: 'IsSeasonal',
    availableFrom: 'AvailableFrom', availableTo: 'AvailableTo'
  };
  Object.keys(fieldMap).forEach(function (k) {
    if (payload.hasOwnProperty(k)) patch[fieldMap[k]] = payload[k];
  });
  if (payload.images) patch.Images = Array.isArray(payload.images) ? payload.images.join(',') : payload.images;
  if (payload.tags) patch.Tags = Array.isArray(payload.tags) ? payload.tags.join(',') : payload.tags;

  const updated = updateRowByKey_('Cakes', 'Id', payload.id, patch);
  if (!updated) return fail_('Cake not found.');
  logAudit_(guard.session.Username, 'UPDATE_CAKE', 'Cake', payload.id, JSON.stringify(patch));
  return ok_(rowToCake_(updated));
}

/** Quick toggle used by the Availability Management screen. */
function adminSetCakeAvailability_(payload) {
  const guard = requireRole_(payload.token, 'Staff');
  if (!guard.ok) return guard.response;
  const updated = updateRowByKey_('Cakes', 'Id', payload.id, { IsAvailable: !!payload.isAvailable, UpdatedAt: nowIso_() });
  if (!updated) return fail_('Cake not found.');
  logAudit_(guard.session.Username, 'SET_AVAILABILITY', 'Cake', payload.id, String(payload.isAvailable));
  return ok_(rowToCake_(updated));
}
