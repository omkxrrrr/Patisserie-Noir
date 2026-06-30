export const SHAPES = [
  { id: 'round', label: 'Round', priceModifier: 0 },
  { id: 'square', label: 'Square', priceModifier: 0 },
  { id: 'heart', label: 'Heart', priceModifier: 150 }
];

export const WEIGHTS = [
  { value: 0.5, label: '0.5 kg', servesApprox: '4-6' },
  { value: 1, label: '1 kg', servesApprox: '8-10' },
  { value: 1.5, label: '1.5 kg', servesApprox: '14-16' },
  { value: 2, label: '2 kg', servesApprox: '20-22' },
  { value: 'custom', label: 'Custom', servesApprox: 'Tell us' }
];

export const FLAVORS = [
  { id: 'chocolate', label: 'Chocolate', priceModifierPerKg: 0 },
  { id: 'vanilla', label: 'Vanilla', priceModifierPerKg: 0 },
  { id: 'strawberry', label: 'Strawberry', priceModifierPerKg: 50 },
  { id: 'butterscotch', label: 'Butterscotch', priceModifierPerKg: 50 },
  { id: 'black_forest', label: 'Black Forest', priceModifierPerKg: 100 },
  { id: 'red_velvet', label: 'Red Velvet', priceModifierPerKg: 150 }
];

export const CREAM_TYPES = [
  { id: 'whipped', label: 'Whipped Cream', priceModifierPerKg: 0 },
  { id: 'fresh_cream', label: 'Fresh Cream', priceModifierPerKg: 30 },
  { id: 'buttercream', label: 'Buttercream', priceModifierPerKg: 60 },
  { id: 'fondant', label: 'Fondant', priceModifierPerKg: 200 }
];

export const FROSTING_TYPES = [
  { id: 'classic', label: 'Classic Smooth', priceModifier: 0 },
  { id: 'ombre', label: 'Ombré', priceModifier: 150 },
  { id: 'drip', label: 'Drip', priceModifier: 200 },
  { id: 'naked', label: 'Naked / Semi-Iced', priceModifier: 0 },
  { id: 'textured', label: 'Textured / Palette', priceModifier: 250 }
];

export const DECORATION_STYLES = [
  { id: 'minimal', label: 'Minimal', priceModifier: 0 },
  { id: 'floral', label: 'Floral', priceModifier: 250 },
  { id: 'themed', label: 'Cartoon / Theme', priceModifier: 350 },
  { id: 'elegant', label: 'Elegant', priceModifier: 300 },
  { id: 'rustic', label: 'Rustic', priceModifier: 150 }
];

export const TOPPER_OPTIONS = [
  { id: 'none', label: 'No Topper', price: 0 },
  { id: 'happy_birthday', label: '"Happy Birthday" Topper', price: 99 },
  { id: 'number', label: 'Number Topper', price: 129 },
  { id: 'custom_name', label: 'Custom Name Topper', price: 199 },
  { id: 'figurine', label: 'Themed Figurine', price: 299 }
];

export const ADDON_PRICES = {
  greetingCard: 49,
  candlesSetOfSix: 29,
  photoPrint: 250
};

export const DELIVERY_CHARGE_DEFAULT = 99;
export const FREE_DELIVERY_THRESHOLD = 1500;
