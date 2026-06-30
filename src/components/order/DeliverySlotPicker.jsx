import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { DELIVERY_SLOTS } from '../../constants/referenceData';
import { orderService } from '../../services/orderService';
import { addDaysIso } from '../../utils/format';

export default function DeliverySlotPicker({ deliveryDate, deliverySlot, onDateChange, onSlotChange }) {
  const [slots, setSlots] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const minDate = addDaysIso(1); // at least next-day delivery so the kitchen has lead time

  useEffect(() => {
    if (!deliveryDate) { setSlots(null); return; }
    let cancelled = false;
    setIsLoading(true);
    orderService.getSlotAvailability(deliveryDate)
      .then((data) => { if (!cancelled) setSlots(data.slots); })
      .catch(() => { if (!cancelled) setSlots(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [deliveryDate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Delivery Date</label>
        <input
          type="date"
          min={minDate}
          value={deliveryDate}
          onChange={(e) => { onDateChange(e.target.value); onSlotChange(''); }}
          className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800 dark:text-blush"
        />
        <p className="mt-1 text-xs text-cocoa-400">We need at least 24 hours' notice to bake fresh.</p>
      </div>

      {deliveryDate && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Delivery Slot</label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-cocoa-400"><Loader2 size={16} className="animate-spin" /> Checking availability…</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DELIVERY_SLOTS.map((s) => {
                const slotInfo = slots?.find((x) => x.slot === s.id);
                const isFull = slotInfo?.isFull;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => onSlotChange(s.id)}
                    className={clsx(
                      'rounded-soft border px-3 py-2.5 text-xs font-semibold transition-colors',
                      isFull
                        ? 'cursor-not-allowed border-cocoa-100 bg-cocoa-50 text-cocoa-300 dark:border-cocoa-700 dark:bg-cocoa-800/50 dark:text-cocoa-500'
                        : deliverySlot === s.id
                          ? 'border-mulberry-500 bg-mulberry-500 text-white'
                          : 'border-cocoa-150 bg-white text-cocoa-600 hover:border-mulberry-300 dark:border-cocoa-600 dark:bg-cocoa-800 dark:text-blush-deep'
                    )}
                  >
                    {s.label}
                    {isFull && <span className="mt-0.5 block text-[10px] font-normal">Fully booked</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
