import { apiGet, apiPost } from '../api/client';
import { withCache, invalidate } from '../api/cache';
import { useAdminAuthStore } from '../store/adminAuthStore';

function withToken(payload = {}) {
  return { ...payload, token: useAdminAuthStore.getState().token };
}

export const inquiryService = {
  submit(payload) {
    return apiPost('submitInquiry', payload);
  },
  list(filters = {}) {
    return apiPost('getInquiries', withToken(filters));
  },
  updateStatus(id, status, staffNotes) {
    return apiPost('updateInquiryStatus', withToken({ id, status, staffNotes }));
  }
};

export const testimonialService = {
  listApproved(limit, featuredOnly = false) {
    return withCache('getTestimonials', { limit, featuredOnly }, () => apiGet('getTestimonials', { limit, featuredOnly }), 120_000);
  },
  submit(payload) {
    return apiPost('submitTestimonial', payload);
  },
  adminList(pendingOnly = false) {
    return apiPost('adminListTestimonials', withToken({ pendingOnly }));
  },
  moderate(id, patch) {
    return apiPost('adminModerateTestimonial', withToken({ id, ...patch }));
  }
};

export const couponService = {
  validate(code, amount) {
    return apiPost('validateCoupon', { code, amount });
  },
  adminList() {
    return apiPost('listCoupons', withToken({}));
  },
  create(payload) {
    return apiPost('createCoupon', withToken(payload));
  },
  setActive(code, isActive) {
    return apiPost('setCouponActive', withToken({ code, isActive }));
  }
};

export const customerService = {
  list(filters = {}) {
    return apiPost('listCustomers', withToken(filters));
  },
  history(phone) {
    return apiPost('getCustomerOrderHistory', withToken({ phone }));
  },
  update(phone, patch) {
    return apiPost('updateCustomerNotesOrVIP', withToken({ phone, ...patch }));
  }
};

export const inventoryService = {
  list(lowStockOnly = false) {
    return apiPost('getInventory', withToken({ lowStockOnly }));
  },
  adjustStock(itemId, delta) {
    return apiPost('adjustInventoryStock', withToken({ itemId, delta }));
  },
  estimateNeeds() {
    return apiPost('estimateIngredientNeeds', withToken({}));
  }
};

export const contentService = {
  banners() {
    return withCache('getBanners', {}, () => apiGet('getBanners'), 180_000);
  },
  gallery() {
    return withCache('getGallery', {}, () => apiGet('getGallery'), 180_000);
  },
  blogPosts(limit) {
    return withCache('getBlogPosts', { limit }, () => apiGet('getBlogPosts', { limit }), 180_000);
  },
  blogPostBySlug(slug) {
    return withCache('getBlogPostBySlug', { slug }, () => apiGet('getBlogPostBySlug', { slug }), 180_000);
  },
  createBanner(payload) { return apiPost('adminCreateBanner', withToken(payload)); },
  updateBanner(payload) { return apiPost('adminUpdateBanner', withToken(payload)); },
  createBlogPost(payload) { return apiPost('adminCreateBlogPost', withToken(payload)); },
  updateBlogPost(payload) { return apiPost('adminUpdateBlogPost', withToken(payload)); },
  createGalleryItem(payload) { return apiPost('adminCreateGalleryItem', withToken(payload)); },
  deleteGalleryItem(id) { return apiPost('adminDeleteGalleryItem', withToken({ id })); },
  invalidateAll() {
    invalidate('getBanners'); invalidate('getGallery'); invalidate('getBlogPosts'); invalidate('getBlogPostBySlug');
  }
};

export const analyticsService = {
  dashboardSummary() {
    return apiPost('getDashboardSummary', withToken({}));
  },
  revenueSeries(days = 30) {
    return apiPost('getRevenueSeries', withToken({ days }));
  }
};

export const staffService = {
  list() { return apiPost('listStaff', withToken({})); },
  create(payload) { return apiPost('createStaff', withToken(payload)); },
  setActive(staffId, isActive) { return apiPost('setStaffActive', withToken({ staffId, isActive })); },
  changePassword(currentPassword, newPassword) {
    return apiPost('changePassword', withToken({ currentPassword, newPassword }));
  }
};

export const auditService = {
  list(filters = {}) { return apiPost('getAuditLogs', withToken(filters)); }
};

export const backupService = {
  exportFull() { return apiPost('exportFullBackup', withToken({})); }
};
