import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Download, ChevronLeft, ChevronRight, Crown, Flame, Copy, MessageCircle, Loader2
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from '../../constants/referenceData';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/format';
import { exportToCsv, exportToExcel } from '../../utils/exportData';
import { generateInvoicePdf } from '../../utils/pdfInvoice';
import { buildWhatsAppLink, whatsappTemplates } from '../../utils/whatsapp';

const PAGE_SIZE = 20;

function StatusBadge({ status }) {
  return <Badge tone={null} className={ORDER_STATUS_COLORS[status] || ''}>{status}</Badge>;
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [vipOnly, setVipOnly] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    orderService.list({ search: debouncedSearch, status, vipOnly, priorityOnly, page, pageSize: PAGE_SIZE })
      .then(setResult)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, status, vipOnly, priorityOnly, page]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, vipOnly, priorityOnly]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function handleStatusFilter(next) {
    setStatus(next);
    setSearchParams(next ? { status: next } : {});
  }

  function toggleSelect(orderId) {
    setSelected((s) => (s.includes(orderId) ? s.filter((id) => id !== orderId) : [...s, orderId]));
  }

  function toggleSelectAll() {
    setSelected((s) => (s.length === result.items.length ? [] : result.items.map((o) => o.orderId)));
  }

  async function bulkUpdate(newStatus) {
    if (!selected.length) return;
    try {
      await orderService.bulkUpdateStatus(selected, newStatus, 'Bulk update from Orders panel');
      toast.success(`Updated ${selected.length} order(s) to ${newStatus}`);
      setSelected([]);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleExport(format) {
    const rows = result.items.map((o) => ({
      OrderId: o.orderId, Customer: o.customerName, Phone: o.phone, Cake: o.cakeName,
      Weight: o.weightKg, DeliveryDate: o.deliveryDate, Slot: o.deliverySlot,
      Status: o.orderStatus, Total: o.totalAmount, VIP: o.isVIP, Priority: o.isPriority, CreatedAt: o.createdAt
    }));
    if (!rows.length) { toast.error('Nothing to export on this page.'); return; }
    if (format === 'csv') exportToCsv(`orders-page-${page}`, rows);
    else exportToExcel(`orders-page-${page}`, rows, 'Orders');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Operations</p>
          <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Orders</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 rounded-pill border border-cocoa-200 px-4 py-2 text-xs font-semibold text-cocoa-600 dark:border-cocoa-600 dark:text-blush-deep">
            <Download size={13} /> CSV
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-1.5 rounded-pill border border-cocoa-200 px-4 py-2 text-xs font-semibold text-cocoa-600 dark:border-cocoa-600 dark:text-blush-deep">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-soft bg-white p-4 shadow-card dark:bg-cocoa-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-300" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or order ID"
            className="w-full rounded-pill border border-cocoa-150 py-2 pl-9 pr-3 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
          />
        </div>
        <select value={status} onChange={(e) => handleStatusFilter(e.target.value)} className="rounded-pill border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-700">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs font-medium text-cocoa-600 dark:text-blush-deep">
          <input type="checkbox" checked={vipOnly} onChange={(e) => setVipOnly(e.target.checked)} className="accent-mulberry-500" /> VIP only
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-cocoa-600 dark:text-blush-deep">
          <input type="checkbox" checked={priorityOnly} onChange={(e) => setPriorityOnly(e.target.checked)} className="accent-mulberry-500" /> Priority only
        </label>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-soft bg-mulberry-50 p-3 text-sm dark:bg-mulberry-500/10">
          <span className="font-semibold text-mulberry-600 dark:text-mulberry-300">{selected.length} selected</span>
          {ORDER_STATUSES.filter((s) => s !== 'Cancelled').slice(0, 4).map((s) => (
            <button key={s} onClick={() => bulkUpdate(s)} className="rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-cocoa-600 dark:bg-cocoa-800 dark:text-blush-deep">
              Mark {s}
            </button>
          ))}
          <button onClick={() => bulkUpdate('Cancelled')} className="rounded-pill bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600">Cancel</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-mulberry-500">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-soft bg-white shadow-card dark:bg-cocoa-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs uppercase tracking-wide text-cocoa-400 dark:border-cocoa-700">
              <th className="px-4 py-3"><input type="checkbox" checked={selected.length === result.items.length && result.items.length > 0} onChange={toggleSelectAll} /></th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Cake</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50 dark:divide-cocoa-700">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={8} />)
            ) : result.items.length === 0 ? (
              <tr><td colSpan={8} className="p-0"><EmptyState title="No orders found" description="Try adjusting your filters." /></td></tr>
            ) : (
              result.items.map((order) => (
                <tr
                  key={order.orderId}
                  onClick={() => setActiveOrderId(order.orderId)}
                  className="cursor-pointer hover:bg-cocoa-50/60 dark:hover:bg-cocoa-700/40"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(order.orderId)} onChange={() => toggleSelect(order.orderId)} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-cocoa-600 dark:text-blush-deep">{order.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-cocoa-700 dark:text-blush">{order.customerName}</p>
                    <p className="text-xs text-cocoa-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">{order.cakeName} <span className="text-cocoa-400">({order.weightKg}kg)</span></td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">{formatDate(order.deliveryDate)}<br /><span className="text-xs text-cocoa-400">{order.deliverySlot}</span></td>
                  <td className="px-4 py-3 font-semibold text-cocoa-700 dark:text-blush">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {order.isVIP && <Crown size={14} className="text-gilt" />}
                      {order.isPriority && <Flame size={14} className="text-mulberry-500" />}
                      {order.isDuplicateFlag && <Copy size={14} className="text-cocoa-300" title="Possible duplicate" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="grid h-9 w-9 place-items-center rounded-full border border-cocoa-150 disabled:opacity-40 dark:border-cocoa-600"><ChevronLeft size={16} /></button>
          <span className="text-sm text-cocoa-500">Page {page} of {result.totalPages} · {result.total} orders</span>
          <button onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages} className="grid h-9 w-9 place-items-center rounded-full border border-cocoa-150 disabled:opacity-40 dark:border-cocoa-600"><ChevronRight size={16} /></button>
        </div>
      )}

      <OrderDetailModal orderId={activeOrderId} onClose={() => setActiveOrderId(null)} onUpdated={fetchOrders} />
    </div>
  );
}

function OrderDetailModal({ orderId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!orderId) { setData(null); return; }
    setIsLoading(true);
    orderService.getById(orderId)
      .then((res) => { setData(res); setStatusInput(res.order.orderStatus); setNote(res.order.staffNotes || ''); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  async function saveStatus() {
    setIsSaving(true);
    try {
      await orderService.updateStatus(orderId, statusInput, 'Updated from order detail');
      toast.success('Status updated.');
      onUpdated();
      const refreshed = await orderService.getById(orderId);
      setData(refreshed);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveNote() {
    try {
      await orderService.addNote(orderId, note);
      toast.success('Note saved.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleFlag(flag) {
    try {
      await orderService.setFlags(orderId, { [flag]: !data.order[flag] });
      const refreshed = await orderService.getById(orderId);
      setData(refreshed);
      onUpdated();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Modal isOpen={!!orderId} onClose={onClose} title={orderId} size="lg">
      {isLoading || !data ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-mulberry-500" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => toggleFlag('isVIP')} className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold ${data.order.isVIP ? 'bg-gilt text-cocoa-800' : 'bg-cocoa-100 text-cocoa-500 dark:bg-cocoa-700'}`}>
              <Crown size={13} /> VIP
            </button>
            <button onClick={() => toggleFlag('isPriority')} className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold ${data.order.isPriority ? 'bg-mulberry-500 text-white' : 'bg-cocoa-100 text-cocoa-500 dark:bg-cocoa-700'}`}>
              <Flame size={13} /> Priority
            </button>
            {data.order.isDuplicateFlag && <Badge tone="default">Possible duplicate order</Badge>}
            <button onClick={() => generateInvoicePdf(data.order)} className="ml-auto text-xs font-semibold text-mulberry-500">Download Invoice</button>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs text-cocoa-400">Customer</p><p className="font-medium text-cocoa-700 dark:text-blush">{data.order.customerName} · {data.order.phone}</p></div>
            <div><p className="text-xs text-cocoa-400">Address</p><p className="font-medium text-cocoa-700 dark:text-blush">{data.order.address}</p></div>
            <div><p className="text-xs text-cocoa-400">Cake</p><p className="font-medium text-cocoa-700 dark:text-blush">{data.order.cakeName} — {data.order.weightKg}kg, {data.order.flavor}</p></div>
            <div><p className="text-xs text-cocoa-400">Delivery</p><p className="font-medium text-cocoa-700 dark:text-blush">{formatDate(data.order.deliveryDate)} · {data.order.deliverySlot}</p></div>
            <div><p className="text-xs text-cocoa-400">Custom Message</p><p className="font-medium text-cocoa-700 dark:text-blush">{data.order.customMessage || '—'}</p></div>
            <div><p className="text-xs text-cocoa-400">Total</p><p className="font-display text-lg text-mulberry-600 dark:text-mulberry-300">{formatCurrency(data.order.totalAmount)}</p></div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['orderConfirmed', 'bakingStarted', 'outForDelivery', 'delivered'].map((key) => (
              <a
                key={key}
                href={buildWhatsAppLink(data.order.phone, whatsappTemplates[key](data.order))}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-pill bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#1a8a4a]"
              >
                <MessageCircle size={12} /> {key.replace(/([A-Z])/g, ' $1')}
              </a>
            ))}
          </div>

          <div className="rounded-soft bg-cocoa-50 p-4 dark:bg-cocoa-700/40">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-400">Update Status</p>
            <div className="flex gap-2">
              <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)} className="flex-1 rounded-pill border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={saveStatus} disabled={isSaving} className="rounded-pill bg-mulberry-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Save</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-400">Staff Notes</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
            <button onClick={saveNote} className="mt-2 text-xs font-semibold text-mulberry-500">Save note</button>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-400">Status Timeline</p>
            <ul className="space-y-2 text-sm">
              {data.timeline.map((t) => (
                <li key={t.Id} className="flex justify-between text-cocoa-500 dark:text-blush-deep/80">
                  <span>{t.FromStatus || '—'} → {t.ToStatus} <span className="text-xs text-cocoa-300">by {t.ChangedBy}</span></span>
                  <span className="text-xs">{formatDateTime(t.CreatedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
