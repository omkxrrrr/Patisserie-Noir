import { apiGet, apiPost } from '../api/client';
import { withCache, invalidate } from '../api/cache';
import { useAdminAuthStore } from '../store/adminAuthStore';

function withToken(payload = {}) {
  return { ...payload, token: useAdminAuthStore.getState().token };
}

export const cakeService = {
  list(filters = {}) {
    return withCache('getCakes', filters, () => apiGet('getCakes', filters), 60_000);
  },
  getById(id) {
    return withCache('getCakeById', { id }, () => apiGet('getCakeById', { id }), 120_000);
  },
  categories() {
    return withCache('getCategories', {}, () => apiGet('getCategories'), 120_000);
  },
  invalidateAll() {
    invalidate('getCakes');
    invalidate('getCakeById');
    invalidate('getCategories');
  },
  // Admin: full catalog including unavailable items, unpaginated for the management table.
  adminList() {
    return apiGet('getCakes', { onlyAvailable: false, pageSize: 500 });
  },
  create(payload) {
    return apiPost('adminCreateCake', withToken(payload));
  },
  update(payload) {
    return apiPost('adminUpdateCake', withToken(payload));
  },
  setAvailability(id, isAvailable) {
    return apiPost('adminSetCakeAvailability', withToken({ id, isAvailable }));
  }
};
