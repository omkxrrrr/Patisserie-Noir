import { useState, useMemo } from 'react';

export function usePagination({ totalItems, pageSize = 12, initialPage = 1 }) {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safePage = Math.min(page, totalPages);
  const range = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return { start, end: start + pageSize };
  }, [safePage, pageSize]);

  return {
    page: safePage,
    totalPages,
    pageSize,
    range,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (p) => setPage(Math.max(1, Math.min(p, totalPages))),
    resetPage: () => setPage(1)
  };
}
