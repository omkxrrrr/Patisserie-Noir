import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Crown, MessageCircle, Loader2, ShoppingBag } from 'lucide-react';
import { customerService } from '../../services/adminServices';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import { ORDER_STATUS_COLORS } from '../../constants/referenceData';

const PAGE_SIZE = 20;

export default function CustomerManagement() {
  const [search, setSearch] = useState('');
  const [vipOnly, setVipOnly] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhone, setActivePhone] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setIsLoading(true);
    customerService.list({ search: debouncedSearch, vipOnly })
      .then(setCustomers)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, vipOnly]);

  const pagination = usePagination({ totalItems: customers.length, pageSize: PAGE_SIZE });

  useEffect(() => { pagination.resetPage(); }, [debouncedSearch, vipOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageItems = customers.slice(pagination.range.start, pagination.range.end);

  async function toggleVIP(phone, isVIP) {
    try {
      await customerService.update(phone, { isVIP: !isVIP });
      setCustomers((prev) => prev.map((c) => (c.phone === phone ? { ...c, isVIP: !isVIP } : c)));
      toast.success(!isVIP ? 'Marked as VIP' : 'Removed VIP status');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Operations</p>
        <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Customers</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-soft bg-white p-4 shadow-card dark:bg-cocoa-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-300" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-pill border border-cocoa-150 py-2 pl-9 pr-3 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-cocoa-600 dark:text-blush-deep">
          <input type="checkbox" checked={vipOnly} onChange={(e) => setVipOnly(e.target.checked)} className="accent-mulberry-500" /> VIP only
        </label>
      </div>

      <div className="overflow-x-auto rounded-soft bg-white shadow-card dark:bg-cocoa-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs uppercase tracking-wide text-cocoa-400 dark:border-cocoa-700">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Lifetime Spend</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">VIP</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50 dark:divide-cocoa-700">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={6} className="p-0"><EmptyState title="No customers found" description="Customers appear here automatically once orders come in." /></td></tr>
            ) : (
              pageItems.map((c) => (
                <tr key={c.phone} onClick={() => setActivePhone(c.phone)} className="cursor-pointer hover:bg-cocoa-50/60 dark:hover:bg-cocoa-700/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-cocoa-700 dark:text-blush">{c.name}</p>
                    <p className="text-xs text-cocoa-400">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">{c.totalOrders}</td>
                  <td className="px-4 py-3 font-semibold text-cocoa-700 dark:text-blush">{formatCurrency(c.lifetimeSpend)}</td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleVIP(c.phone, c.isVIP)} className={`flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold ${c.isVIP ? 'bg-gilt text-cocoa-800' : 'bg-cocoa-100 text-cocoa-400 dark:bg-cocoa-700'}`}>
                      <Crown size={12} /> {c.isVIP ? 'VIP' : 'Mark VIP'}
                    </button>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-xs text-cocoa-400">{c.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={pagination.prevPage} disabled={pagination.page === 1} className="rounded-full border border-cocoa-150 px-3 py-1.5 text-xs disabled:opacity-40 dark:border-cocoa-600">Prev</button>
          <span className="text-sm text-cocoa-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={pagination.nextPage} disabled={pagination.page === pagination.totalPages} className="rounded-full border border-cocoa-150 px-3 py-1.5 text-xs disabled:opacity-40 dark:border-cocoa-600">Next</button>
        </div>
      )}

      <CustomerDetailModal
        phone={activePhone}
        customer={customers.find((c) => c.phone === activePhone)}
        onClose={() => setActivePhone(null)}
        onSaved={(patch) => setCustomers((prev) => prev.map((c) => (c.phone === activePhone ? { ...c, ...patch } : c)))}
      />
    </div>
  );
}

function CustomerDetailModal({ phone, customer, onClose, onSaved }) {
  const [history, setHistory] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!phone) { setHistory(null); return; }
    setNotes(customer?.notes || '');
    customerService.history(phone).then(setHistory).catch(() => setHistory([]));
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveNotes() {
    setIsSaving(true);
    try {
      await customerService.update(phone, { notes });
      onSaved({ notes });
      toast.success('Notes saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={!!phone} onClose={onClose} title={customer?.name || phone} size="lg">
      {!customer ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-mulberry-500" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-cocoa-500">{customer.phone}</span>
              {customer.email && <span className="text-cocoa-500">{customer.email}</span>}
              {customer.isVIP && <Badge tone="gold">VIP Customer</Badge>}
            </div>
            <a
              href={buildWhatsAppLink(customer.phone, `Hi ${customer.name}, this is ${import.meta.env.VITE_SHOP_NAME || 'the bakery'}!`)}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-pill bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#1a8a4a]"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-xs text-cocoa-400">Total Orders</p><p className="font-semibold text-cocoa-700 dark:text-blush">{customer.totalOrders}</p></div>
            <div><p className="text-xs text-cocoa-400">Lifetime Spend</p><p className="font-semibold text-cocoa-700 dark:text-blush">{formatCurrency(customer.lifetimeSpend)}</p></div>
            <div><p className="text-xs text-cocoa-400">First Order</p><p className="font-semibold text-cocoa-700 dark:text-blush">{customer.firstOrderAt ? formatDate(customer.firstOrderAt) : '—'}</p></div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-400">Notes</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
            <button onClick={saveNotes} disabled={isSaving} className="mt-2 text-xs font-semibold text-mulberry-500">Save notes</button>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cocoa-400"><ShoppingBag size={13} /> Order History</p>
            {history === null ? (
              <Loader2 className="animate-spin text-mulberry-500" size={18} />
            ) : history.length === 0 ? (
              <p className="text-sm text-cocoa-400">No past orders.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((o) => (
                  <li key={o.orderId} className="flex items-center justify-between rounded-soft bg-cocoa-50 px-3 py-2.5 text-sm dark:bg-cocoa-700/40">
                    <div>
                      <p className="font-medium text-cocoa-700 dark:text-blush">{o.cakeName} <span className="font-mono text-xs text-cocoa-400">{o.orderId}</span></p>
                      <p className="text-xs text-cocoa-400">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={null} className={ORDER_STATUS_COLORS[o.orderStatus] || ''}>{o.orderStatus}</Badge>
                      <span className="font-semibold text-cocoa-700 dark:text-blush">{formatCurrency(o.totalAmount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
