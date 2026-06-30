import { apiGet } from '../api/client';
import { withCache, invalidate } from '../api/cache';

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
  }
};
