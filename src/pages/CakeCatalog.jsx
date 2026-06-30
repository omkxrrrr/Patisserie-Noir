import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cakeService } from '../services/cakeService';
import CakeCard from '../components/cake/CakeCard';
import CakeFilters from '../components/cake/CakeFilters';
import { CakeCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { recommendCakes } from '../utils/aiSuggestions';

const PAGE_SIZE = 12;

export default function CakeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // AI recommendation helper
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    cakeService.list({ search: debouncedSearch, category, sort, page, pageSize: PAGE_SIZE })
      .then((data) => { if (!cancelled) setResult(data); })
      .catch(() => { if (!cancelled) setResult({ items: [], total: 0, totalPages: 1 }); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, category, sort, page]);

  function handleCategoryChange(next) {
    setCategory(next);
    setSearchParams(next ? { category: next } : {});
  }

  async function runAiSearch() {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const allCakes = await cakeService.list({ pageSize: 200 });
      setAiResults(recommendCakes(aiQuery, allCakes.items));
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">The full menu</p>
          <h1 className="font-display text-display-md text-cocoa-700 dark:text-blush">Cake Menu</h1>
        </div>
        <button
          onClick={() => setShowAiHelper((v) => !v)}
          className="flex items-center gap-2 rounded-pill bg-gilt px-4 py-2.5 text-sm font-semibold text-cocoa-800 shadow-glow"
        >
          <Sparkles size={16} /> Not sure what to pick?
        </button>
      </div>

      <AnimatePresence>
        {showAiHelper && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base text-cocoa-700 dark:text-blush">Describe the cake you need</h3>
                <p className="text-xs text-cocoa-400">e.g. "Birthday cake for a football-loving 10 year old" or "elegant wedding cake"</p>
              </div>
              <button onClick={() => setShowAiHelper(false)} className="text-cocoa-400"><X size={18} /></button>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAiSearch()}
                placeholder="Tell us about the occasion, age, or theme…"
                className="flex-1 rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
              />
              <button onClick={runAiSearch} disabled={isAiLoading} className="rounded-pill bg-mulberry-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {isAiLoading ? 'Thinking…' : 'Suggest'}
              </button>
            </div>

            {aiResults && (
              aiResults.length ? (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {aiResults.map((cake) => <CakeCard key={cake.id} cake={cake} matchReason={cake.matchReason} />)}
                </div>
              ) : (
                <p className="mt-4 text-sm text-cocoa-400">No close matches yet — try simpler keywords like "unicorn" or "chocolate".</p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CakeFilters
        search={search} onSearchChange={setSearch}
        category={category} onCategoryChange={handleCategoryChange}
        sort={sort} onSortChange={setSort}
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CakeCardSkeleton key={i} />)}
          </div>
        ) : result.items.length === 0 ? (
          <EmptyState
            title="No cakes match that search"
            description="Try a different keyword or clear your filters."
            action={<button onClick={() => { setSearch(''); handleCategoryChange(''); }} className="text-sm font-semibold text-mulberry-500">Clear filters</button>}
          />
        ) : (
          <>
            <p className="mb-4 text-xs text-cocoa-400">{result.total} cake{result.total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {result.items.map((cake) => <CakeCard key={cake.id} cake={cake} />)}
            </div>
          </>
        )}

        {result.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="grid h-9 w-9 place-items-center rounded-full border border-cocoa-150 disabled:opacity-40 dark:border-cocoa-600">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-cocoa-500">Page {page} of {result.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages} className="grid h-9 w-9 place-items-center rounded-full border border-cocoa-150 disabled:opacity-40 dark:border-cocoa-600">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
