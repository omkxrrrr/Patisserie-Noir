import {
  SHAPES, FLAVORS, CREAM_TYPES, FROSTING_TYPES, DECORATION_STYLES,
  TOPPER_OPTIONS, ADDON_PRICES, DELIVERY_CHARGE_DEFAULT, FREE_DELIVERY_THRESHOLD
} from '../constants/cakeOptions';

function findModifier(list, id, key = 'priceModifier') {
  const found = list.find((item) => item.id === id);
  return found ? (found[key] ?? 0) : 0;
}

/**
 * @param {object} cake - { basePrice } from the catalog (price per kg at 1kg baseline)
 * @param {object} customization - shape, weightKg, flavor, creamType, frostingType,
 *   decorationStyle, topper, greetingCard (bool), candles (bool), photoPrint (bool)
 * @returns {{ basePrice:number, addOnsPrice:number, deliveryCharge:number, discountAmount:number, total:number, breakdown:Array }}
 */
export function calculatePrice(cake, customization, discount = 0) {
  const weight = customization.weightKg === 'custom'
    ? Number(customization.customWeightKg) || 1
    : Number(customization.weightKg) || 1;

  const breakdown = [];

  const perKgBase = Number(cake?.basePrice) || 0;
  const flavorMod = findModifier(FLAVORS, customization.flavor, 'priceModifierPerKg');
  const creamMod = findModifier(CREAM_TYPES, customization.creamType, 'priceModifierPerKg');
  const perKgTotal = perKgBase + flavorMod + creamMod;
  const basePrice = Math.round(perKgTotal * weight);
  breakdown.push({ label: `Base (${weight}kg)`, amount: basePrice });

  let addOnsPrice = 0;

  const shapeMod = findModifier(SHAPES, customization.shape);
  if (shapeMod) { addOnsPrice += shapeMod; breakdown.push({ label: 'Shape', amount: shapeMod }); }

  const frostingMod = findModifier(FROSTING_TYPES, customization.frostingType);
  if (frostingMod) { addOnsPrice += frostingMod; breakdown.push({ label: 'Frosting', amount: frostingMod }); }

  const decorationMod = findModifier(DECORATION_STYLES, customization.decorationStyle);
  if (decorationMod) { addOnsPrice += decorationMod; breakdown.push({ label: 'Decoration', amount: decorationMod }); }

  const topperMod = findModifier(TOPPER_OPTIONS, customization.topper, 'price');
  if (topperMod) { addOnsPrice += topperMod; breakdown.push({ label: 'Topper', amount: topperMod }); }

  if (customization.greetingCard) {
    addOnsPrice += ADDON_PRICES.greetingCard;
    breakdown.push({ label: 'Greeting card', amount: ADDON_PRICES.greetingCard });
  }
  if (customization.candles) {
    addOnsPrice += ADDON_PRICES.candlesSetOfSix;
    breakdown.push({ label: 'Candles (set of 6)', amount: ADDON_PRICES.candlesSetOfSix });
  }
  if (customization.photoPrint) {
    addOnsPrice += ADDON_PRICES.photoPrint;
    breakdown.push({ label: 'Edible photo print', amount: ADDON_PRICES.photoPrint });
  }

  const subtotal = basePrice + addOnsPrice;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE_DEFAULT;

  const total = Math.max(subtotal + deliveryCharge - discount, 0);

  return {
    basePrice,
    addOnsPrice,
    deliveryCharge,
    discountAmount: discount,
    subtotal,
    total,
    breakdown
  };
}
