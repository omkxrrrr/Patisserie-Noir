import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import { formatCurrency } from '../../utils/format';

export default function CakeCard({ cake, isFavorite, onToggleFavorite, matchReason }) {
  const fallbackImage = '/cake-placeholder.svg';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-soft bg-white shadow-card transition-shadow hover:shadow-lift dark:bg-cocoa-800"
    >
      <Link to={`/cakes/${cake.slug || cake.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-cocoa-100 dark:bg-cocoa-700">
          <img
            src={cake.images?.[0] || fallbackImage}
            onError={(e) => { e.currentTarget.src = fallbackImage; }}
            alt={cake.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {cake.isBestSeller && <Badge tone="gold">Bestseller</Badge>}
            {cake.isTrending && <Badge tone="mulberry">Trending</Badge>}
            {!cake.isAvailable && <Badge tone="danger">Unavailable</Badge>}
          </div>
        </div>
      </Link>

      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(cake.id)}
          aria-label="Toggle favorite"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-cocoa-600 shadow-card transition-colors hover:text-mulberry-500 dark:bg-cocoa-900/80"
        >
          <Heart size={16} className={isFavorite ? 'fill-mulberry-500 text-mulberry-500' : ''} />
        </button>
      )}

      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-cocoa-300">{cake.category}</p>
        <Link to={`/cakes/${cake.slug || cake.id}`}>
          <h3 className="mt-1 font-display text-lg text-cocoa-700 dark:text-blush">{cake.name}</h3>
        </Link>
        {matchReason && <p className="mt-1 text-xs font-medium text-mulberry-500">{matchReason}</p>}
        <div className="mt-2"><StarRating rating={cake.rating} count={cake.ratingCount} /></div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg text-cocoa-700 dark:text-blush">{formatCurrency(cake.basePrice)}<span className="text-xs text-cocoa-400">/kg</span></span>
          <Link
            to={`/cakes/${cake.slug || cake.id}`}
            className="rounded-pill bg-cocoa-50 px-3.5 py-1.5 text-xs font-semibold text-cocoa-700 transition-colors hover:bg-mulberry-500 hover:text-white dark:bg-cocoa-700 dark:text-blush"
          >
            Customize
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
