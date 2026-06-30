/**
 * Content.gs
 * Backs Homepage Banner Management, Cake Gallery Management, and Blog
 * Management — all admin-editable, all served publicly via GET.
 */

// ── Banners ──────────────────────────────────────────────────────────

function rowToBanner_(r) {
  return { id: r.Id, imageUrl: r.ImageUrl, title: r.Title, subtitle: r.Subtitle, linkUrl: r.LinkUrl, sortOrder: Number(r.SortOrder) || 0, isActive: toBool_(r.IsActive) };
}

function getBanners_() {
  const banners = readSheet_('Banners', CACHE_TTL.MEDIUM)
    .filter(function (r) { return toBool_(r.IsActive); })
    .map(rowToBanner_)
    .sort(function (a, b) { return a.sortOrder - b.sortOrder; });
  return ok_(banners);
}

function adminCreateBanner_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const id = generateId_('BNR');
  appendRow_('Banners', {
    Id: id, ImageUrl: payload.imageUrl || '', Title: payload.title || '', Subtitle: payload.subtitle || '',
    LinkUrl: payload.linkUrl || '', SortOrder: payload.sortOrder || 0, IsActive: payload.isActive !== false
  });
  return ok_({ id: id });
}

function adminUpdateBanner_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const patch = {};
  ['imageUrl', 'title', 'subtitle', 'linkUrl', 'sortOrder', 'isActive'].forEach(function (k) {
    if (payload.hasOwnProperty(k)) patch[k.charAt(0).toUpperCase() + k.slice(1)] = payload[k];
  });
  const updated = updateRowByKey_('Banners', 'Id', payload.id, patch);
  if (!updated) return fail_('Banner not found.');
  return ok_(rowToBanner_(updated));
}

// ── Gallery (Instagram-style grid) ───────────────────────────────────

function rowToGalleryItem_(r) {
  return { id: r.Id, imageUrl: r.ImageUrl, caption: r.Caption, isActive: toBool_(r.IsActive), sortOrder: Number(r.SortOrder) || 0 };
}

function getGallery_() {
  const items = readSheet_('Gallery', CACHE_TTL.MEDIUM)
    .filter(function (r) { return toBool_(r.IsActive); })
    .map(rowToGalleryItem_)
    .sort(function (a, b) { return a.sortOrder - b.sortOrder; });
  return ok_(items);
}

function adminCreateGalleryItem_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const id = generateId_('GAL');
  appendRow_('Gallery', { Id: id, ImageUrl: payload.imageUrl || '', Caption: payload.caption || '', IsActive: true, SortOrder: payload.sortOrder || 0 });
  return ok_({ id: id });
}

function adminDeleteGalleryItem_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const updated = updateRowByKey_('Gallery', 'Id', payload.id, { IsActive: false });
  if (!updated) return fail_('Gallery item not found.');
  return ok_({ deleted: true });
}

// ── Blog ─────────────────────────────────────────────────────────────

function rowToBlogPost_(r) {
  return {
    id: r.Id, slug: r.Slug, title: r.Title, excerpt: r.Excerpt, content: r.Content, coverImage: r.CoverImage,
    metaTitle: r.MetaTitle, metaDescription: r.MetaDescription, isPublished: toBool_(r.IsPublished),
    publishedAt: r.PublishedAt, createdAt: r.CreatedAt
  };
}

function getBlogPosts_(payload) {
  payload = payload || {};
  let posts = readSheet_('BlogPosts', CACHE_TTL.MEDIUM).filter(function (r) { return toBool_(r.IsPublished); }).map(rowToBlogPost_);
  posts.sort(function (a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); });
  if (payload.limit) posts = posts.slice(0, Number(payload.limit));
  return ok_(posts);
}

function getBlogPostBySlug_(payload) {
  const row = readSheet_('BlogPosts', CACHE_TTL.MEDIUM).find(function (r) { return r.Slug === payload.slug && toBool_(r.IsPublished); });
  if (!row) return fail_('Post not found.');
  return ok_(rowToBlogPost_(row));
}

function adminCreateBlogPost_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const id = generateId_('BLOG');
  const now = nowIso_();
  appendRow_('BlogPosts', {
    Id: id, Slug: (payload.slug || payload.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    Title: payload.title || '', Excerpt: payload.excerpt || '', Content: payload.content || '',
    CoverImage: payload.coverImage || '', MetaTitle: payload.metaTitle || payload.title || '',
    MetaDescription: payload.metaDescription || payload.excerpt || '',
    IsPublished: !!payload.isPublished, PublishedAt: payload.isPublished ? now : '', CreatedAt: now
  });
  return ok_({ id: id });
}

function adminUpdateBlogPost_(payload) {
  const guard = requireRole_(payload.token, 'Manager');
  if (!guard.ok) return guard.response;
  const patch = {};
  ['title', 'excerpt', 'content', 'coverImage', 'metaTitle', 'metaDescription'].forEach(function (k) {
    if (payload.hasOwnProperty(k)) patch[k.charAt(0).toUpperCase() + k.slice(1)] = payload[k];
  });
  if (payload.hasOwnProperty('isPublished')) {
    patch.IsPublished = !!payload.isPublished;
    if (payload.isPublished) patch.PublishedAt = nowIso_();
  }
  const updated = updateRowByKey_('BlogPosts', 'Id', payload.id, patch);
  if (!updated) return fail_('Post not found.');
  return ok_(rowToBlogPost_(updated));
}
