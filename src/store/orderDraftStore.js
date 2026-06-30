import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculatePrice } from '../utils/priceCalculator';

const initialCustomization = {
  shape: 'round',
  weightKg: 1,
  customWeightKg: '',
  flavor: 'chocolate',
  creamType: 'whipped',
  frostingType: 'classic',
  decorationStyle: 'minimal',
  topper: 'none',
  greetingCard: false,
  candles: false,
  photoPrint: false,
  theme: '',
  customMessage: '',
  photoUploadUrl: '',
  referenceImageUrl: ''
};

export const useOrderDraftStore = create(
  persist(
    (set, get) => ({
      cake: null,
      occasion: '',
      customization: { ...initialCustomization },
      coupon: null, // { code, discount }

      setCake: (cake) => set({ cake }),
      setOccasion: (occasion) => set({ occasion }),
      updateCustomization: (patch) => set({ customization: { ...get().customization, ...patch } }),
      resetCustomization: () => set({ customization: { ...initialCustomization } }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      getPricing: () => {
        const { cake, customization, coupon } = get();
        return calculatePrice(cake, customization, coupon?.discount || 0);
      },

      resetDraft: () => set({ cake: null, occasion: '', customization: { ...initialCustomization }, coupon: null })
    }),
    { name: 'pn-order-draft', storage: createJSONStorage(() => sessionStorage) }
  )
);
