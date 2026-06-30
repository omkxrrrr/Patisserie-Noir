import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const prefersDark = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false;

export const useUiStore = create(
  persist(
    (set, get) => ({
      isDarkMode: prefersDark,
      isMobileNavOpen: false,

      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        document.documentElement.classList.toggle('dark', next);
      },
      setDarkMode: (value) => {
        set({ isDarkMode: value });
        document.documentElement.classList.toggle('dark', value);
      },
      setMobileNavOpen: (value) => set({ isMobileNavOpen: value }),
      toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen }))
    }),
    {
      name: 'pn-ui-prefs',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      onRehydrateStorage: () => (state) => {
        if (state) document.documentElement.classList.toggle('dark', state.isDarkMode);
      }
    }
  )
);
