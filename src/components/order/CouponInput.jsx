import { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import { couponService } from '../../services/adminServices';

export default function CouponInput({ orderAmount, coupon, onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    if (!code.trim()) return;
    setIsChecking(true);
    setError('');
    try {
      const result = await couponService.validate(code.trim(), orderAmount);
      onApply({ code: result.code, discount: result.discount });
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-soft bg-sage-light px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-sage"><Tag size={15} /> {coupon.code} applied</span>
        <button onClick={onRemove} className="text-sage hover:text-cocoa-700"><X size={16} /></button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm uppercase dark:border-cocoa-600 dark:bg-cocoa-800"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isChecking || !code.trim()}
          className="flex items-center gap-1.5 rounded-pill bg-cocoa-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isChecking && <Loader2 size={14} className="animate-spin" />} Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
