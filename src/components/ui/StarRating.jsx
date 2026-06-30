import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, count, size = 14 }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rounded ? 'fill-gilt text-gilt' : 'fill-cocoa-100 text-cocoa-200 dark:fill-cocoa-600 dark:text-cocoa-600'}
          />
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-cocoa-400">({count})</span>}
    </span>
  );
}
