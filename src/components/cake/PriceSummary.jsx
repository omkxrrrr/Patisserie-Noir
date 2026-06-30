import { formatCurrency } from '../../utils/format';

export default function PriceSummary({ pricing, couponCode, sticky = true }) {
  if (!pricing) return null;
  return (
    <div className={`${sticky ? 'lg:sticky lg:top-28' : ''} rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800`}>
      <h3 className="font-display text-lg text-cocoa-700 dark:text-blush">Price Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        {pricing.breakdown.map((item, i) => (
          <div key={i} className="flex justify-between text-cocoa-500 dark:text-blush-deep/80">
            <span>{item.label}</span>
            <span>{formatCurrency(item.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-cocoa-500 dark:text-blush-deep/80">
          <span>Delivery charge</span>
          <span>{pricing.deliveryCharge === 0 ? 'Free' : formatCurrency(pricing.deliveryCharge)}</span>
        </div>
        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-sage">
            <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
            <span>-{formatCurrency(pricing.discountAmount)}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-cocoa-100 pt-4 dark:border-cocoa-700">
        <span className="font-display text-base text-cocoa-700 dark:text-blush">Total</span>
        <span className="font-display text-2xl text-mulberry-600 dark:text-mulberry-300">{formatCurrency(pricing.total)}</span>
      </div>
      <p className="mt-3 text-xs text-cocoa-400">
        Final amount is confirmed by our team and paid directly to the bakery — no online payment here.
      </p>
    </div>
  );
}
