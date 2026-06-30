import { Search } from 'lucide-react';
import clsx from 'clsx';
import { CAKE_CATEGORIES } from '../../constants/referenceData';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
];

export default function CakeFilters({ search, onSearchChange, category, onCategoryChange, sort, onSortChange }) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-300" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cakes — try “red velvet” or “unicorn”"
          className="w-full rounded-pill border border-cocoa-150 bg-white py-3 pl-11 pr-4 text-sm text-cocoa-700 placeholder:text-cocoa-300 focus:border-mulberry-400 dark:border-cocoa-600 dark:bg-cocoa-800 dark:text-blush"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={clsx(
              'rounded-pill px-4 py-1.5 text-xs font-semibold transition-colors',
              !category ? 'bg-mulberry-500 text-white' : 'bg-white text-cocoa-600 hover:bg-cocoa-50 dark:bg-cocoa-800 dark:text-blush-deep'
            )}
          >
            All
          </button>
          {CAKE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={clsx(
                'rounded-pill px-4 py-1.5 text-xs font-semibold transition-colors',
                category === c ? 'bg-mulberry-500 text-white' : 'bg-white text-cocoa-600 hover:bg-cocoa-50 dark:bg-cocoa-800 dark:text-blush-deep'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-pill border border-cocoa-150 bg-white px-4 py-2 text-xs font-semibold text-cocoa-600 focus:border-mulberry-400 dark:border-cocoa-600 dark:bg-cocoa-800 dark:text-blush-deep"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
