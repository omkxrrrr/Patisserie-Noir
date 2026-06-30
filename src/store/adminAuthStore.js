import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost } from '../api/client';

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      staff: null, // { id, name, username, role }
      expiresAt: null,
      isLoading: false,
      error: null,

      async login(username, password) {
        set({ isLoading: true, error: null });
        try {
          const data = await apiPost('adminLogin', { username, password });
          set({ token: data.token, staff: data.staff, expiresAt: data.expiresAt, isLoading: false });
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      async logout() {
        const token = get().token;
        set({ token: null, staff: null, expiresAt: null });
        if (token) {
          try { await apiPost('adminLogout', { token }); } catch { /* best effort */ }
        }
      },

      isAuthenticated() {
        const { token, expiresAt } = get();
        return !!token && !!expiresAt && new Date(expiresAt).getTime() > Date.now();
      },

      hasRole(minRole) {
        const rank = { Staff: 1, Manager: 2, Admin: 3, Owner: 4 };
        const role = get().staff?.role;
        return role && rank[role] >= rank[minRole];
      }
    }),
    { name: 'pn-admin-session' }
  )
);
