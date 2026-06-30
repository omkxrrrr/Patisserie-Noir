import { apiGet, apiPost } from '../api/client';
import { withCache, invalidate } from '../api/cache';
import { useAdminAuthStore } from '../store/adminAuthStore';

function withToken(payload = {}) {
  return { ...payload, token: useAdminAuthStore.getState().token };
}

export const orderService = {
  // ── Public ────────────────────────────────────────────────────────
  getSlotAvailability(date) {
    return withCache('getSlotAvailability', { date }, () => apiGet('getSlotAvailability', { date }), 20_000);
  },
  create(orderPayload) {
    invalidate('getSlotAvailability');
    return apiPost('createOrder', orderPayload);
  },

  // ── Admin ─────────────────────────────────────────────────────────
  list(filters = {}) {
    return apiPost('getOrders', withToken(filters));
  },
  getById(orderId) {
    return apiPost('getOrderById', withToken({ orderId }));
  },
  updateStatus(orderId, status, note = '') {
    return apiPost('updateOrderStatus', withToken({ orderId, status, note }));
  },
  bulkUpdateStatus(orderIds, status, note = '') {
    return apiPost('bulkUpdateOrderStatus', withToken({ orderIds, status, note }));
  },
  addNote(orderId, note) {
    return apiPost('addOrderNote', withToken({ orderId, note }));
  },
  setFlags(orderId, flags) {
    return apiPost('setOrderFlags', withToken({ orderId, ...flags }));
  },
  kitchenQueue() {
    return apiPost('getKitchenQueue', withToken({}));
  }
};
