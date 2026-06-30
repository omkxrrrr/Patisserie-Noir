import clsx from 'clsx';
import {
  SHAPES, WEIGHTS, FLAVORS, CREAM_TYPES, FROSTING_TYPES,
  DECORATION_STYLES, TOPPER_OPTIONS
} from '../../constants/cakeOptions';
import FileUploadField from '../shared/FileUploadField';

function OptionGroup({ title, children }) {
  return (
    <div className="border-b border-cocoa-100 pb-6 last:border-0 dark:border-cocoa-700">
      <h4 className="mb-3 font-display text-base text-cocoa-700 dark:text-blush">{title}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, surcharge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-pill border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-mulberry-500 bg-mulberry-500 text-white'
          : 'border-cocoa-150 bg-white text-cocoa-600 hover:border-mulberry-300 dark:border-cocoa-600 dark:bg-cocoa-800 dark:text-blush-deep'
      )}
    >
      {children}
      {!!surcharge && <span className={clsx('ml-1.5 text-xs', active ? 'text-white/80' : 'text-cocoa-400')}>+₹{surcharge}</span>}
    </button>
  );
}

export default function CakeCustomizerPanel({ customization, onChange }) {
  const set = (patch) => onChange(patch);

  return (
    <div className="space-y-6">
      <OptionGroup title="Shape">
        {SHAPES.map((s) => (
          <Chip key={s.id} active={customization.shape === s.id} onClick={() => set({ shape: s.id })} surcharge={s.priceModifier}>
            {s.label}
          </Chip>
        ))}
      </OptionGroup>

      <OptionGroup title="Weight">
        {WEIGHTS.map((w) => (
          <Chip key={w.value} active={customization.weightKg === w.value} onClick={() => set({ weightKg: w.value })}>
            {w.label} <span className="ml-1 text-xs opacity-70">· serves {w.servesApprox}</span>
          </Chip>
        ))}
        {customization.weightKg === 'custom' && (
          <input
            type="number" min="0.5" step="0.5" placeholder="kg"
            value={customization.customWeightKg}
            onChange={(e) => set({ customWeightKg: e.target.value })}
            className="w-24 rounded-pill border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
          />
        )}
      </OptionGroup>

      <OptionGroup title="Flavor">
        {FLAVORS.map((f) => (
          <Chip key={f.id} active={customization.flavor === f.id} onClick={() => set({ flavor: f.id })} surcharge={f.priceModifierPerKg}>
            {f.label}
          </Chip>
        ))}
      </OptionGroup>

      <OptionGroup title="Cream Type">
        {CREAM_TYPES.map((c) => (
          <Chip key={c.id} active={customization.creamType === c.id} onClick={() => set({ creamType: c.id })} surcharge={c.priceModifierPerKg}>
            {c.label}
          </Chip>
        ))}
      </OptionGroup>

      <OptionGroup title="Frosting Style">
        {FROSTING_TYPES.map((f) => (
          <Chip key={f.id} active={customization.frostingType === f.id} onClick={() => set({ frostingType: f.id })} surcharge={f.priceModifier}>
            {f.label}
          </Chip>
        ))}
      </OptionGroup>

      <OptionGroup title="Decoration Style">
        {DECORATION_STYLES.map((d) => (
          <Chip key={d.id} active={customization.decorationStyle === d.id} onClick={() => set({ decorationStyle: d.id })} surcharge={d.priceModifier}>
            {d.label}
          </Chip>
        ))}
      </OptionGroup>

      <OptionGroup title="Cake Topper">
        {TOPPER_OPTIONS.map((t) => (
          <Chip key={t.id} active={customization.topper === t.id} onClick={() => set({ topper: t.id })} surcharge={t.price}>
            {t.label}
          </Chip>
        ))}
      </OptionGroup>

      <div className="border-b border-cocoa-100 pb-6 dark:border-cocoa-700">
        <h4 className="mb-3 font-display text-base text-cocoa-700 dark:text-blush">Add-ons</h4>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-cocoa-600 dark:text-blush-deep">
            <input type="checkbox" checked={customization.greetingCard} onChange={(e) => set({ greetingCard: e.target.checked })} className="h-4 w-4 accent-mulberry-500" />
            Greeting card <span className="text-cocoa-400">+₹49</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-cocoa-600 dark:text-blush-deep">
            <input type="checkbox" checked={customization.candles} onChange={(e) => set({ candles: e.target.checked })} className="h-4 w-4 accent-mulberry-500" />
            Candles (set of 6) <span className="text-cocoa-400">+₹29</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-cocoa-600 dark:text-blush-deep">
            <input type="checkbox" checked={customization.photoPrint} onChange={(e) => set({ photoPrint: e.target.checked })} className="h-4 w-4 accent-mulberry-500" />
            Edible photo print on cake <span className="text-cocoa-400">+₹250</span>
          </label>
        </div>
      </div>

      <div className="border-b border-cocoa-100 pb-6 dark:border-cocoa-700">
        <h4 className="mb-3 font-display text-base text-cocoa-700 dark:text-blush">Custom Message</h4>
        <input
          value={customization.customMessage}
          onChange={(e) => set({ customMessage: e.target.value })}
          maxLength={60}
          placeholder='e.g. "Happy 10th Birthday, Aryan!"'
          className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
        />
        <p className="mt-1 text-xs text-cocoa-400">{customization.customMessage.length}/60 — this goes on the cake itself.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {customization.photoPrint && (
          <FileUploadField
            label="Photo to print on cake"
            value={customization.photoUploadUrl}
            onChange={(url) => set({ photoUploadUrl: url })}
            purpose="photo_print"
            hint="We'll print this directly onto edible icing sheet."
          />
        )}
        <FileUploadField
          label="Reference image (optional)"
          value={customization.referenceImageUrl}
          onChange={(url) => set({ referenceImageUrl: url })}
          purpose="reference"
          hint="Inspiration photo for the decorator — not printed on the cake."
        />
      </div>
    </div>
  );
}
