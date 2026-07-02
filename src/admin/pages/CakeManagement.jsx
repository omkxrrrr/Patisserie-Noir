import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Star, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { cakeService } from '../../services/cakeService';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import FileUploadField from '../../components/shared/FileUploadField';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import { CAKE_CATEGORIES } from '../../constants/referenceData';

const EMPTY_FORM = {
  id: null, name: '', category: CAKE_CATEGORIES[0], description: '', basePrice: '',
  images: '', isFeatured: false, isBestSeller: false, isTrending: false,
  isAvailable: true, isSeasonal: false, tags: ''
};

export default function CakeManagement() {
  const [cakes, setCakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, EMPTY_FORM = create, cake = edit

  const debouncedSearch = useDebounce(search, 300);

  function load() {
    setIsLoading(true);
    cakeService.adminList()
      .then((res) => setCakes(res.items || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  const visible = cakes.filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  async function toggleAvailability(cake) {
    try {
      await cakeService.setAvailability(cake.id, !cake.isAvailable);
      setCakes((prev) => prev.map((c) => (c.id === cake.id ? { ...c, isAvailable: !c.isAvailable } : c)));
      cakeService.invalidateAll();
      toast.success(!cake.isAvailable ? 'Cake is now available' : 'Cake marked unavailable');
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleSaved(saved) {
    setCakes((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
    cakeService.invalidateAll();
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Marketing</p>
          <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Cake Menu</h1>
        </div>
        <button
          onClick={() => setEditing(EMPTY_FORM)}
          className="flex items-center gap-1.5 rounded-pill bg-mulberry-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} /> Add Cake
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-300" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cakes"
          className="w-full rounded-pill border border-cocoa-150 py-2 pl-9 pr-3 text-sm dark:border-cocoa-600 dark:bg-cocoa-700"
        />
      </div>

      <div className="overflow-x-auto rounded-soft bg-white shadow-card dark:bg-cocoa-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs uppercase tracking-wide text-cocoa-400 dark:border-cocoa-700">
              <th className="px-4 py-3">Cake</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50 dark:divide-cocoa-700">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
            ) : visible.length === 0 ? (
              <tr><td colSpan={5} className="p-0"><EmptyState title="No cakes yet" description="Add your first cake to the menu using the button above." /></td></tr>
            ) : (
              visible.map((c) => (
                <tr key={c.id} onClick={() => setEditing(c)} className="cursor-pointer hover:bg-cocoa-50/60 dark:hover:bg-cocoa-700/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.images?.[0] || '/cake-placeholder.svg'} alt="" className="h-10 w-10 rounded-soft object-cover" />
                      <p className="font-medium text-cocoa-700 dark:text-blush">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">{c.category}</td>
                  <td className="px-4 py-3 font-semibold text-cocoa-700 dark:text-blush">{formatCurrency(c.basePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {c.isFeatured && <Badge tone="gold"><Star size={10} /></Badge>}
                      {c.isBestSeller && <Badge tone="mulberry"><Flame size={10} /></Badge>}
                      {c.isTrending && <Badge tone="sage"><TrendingUp size={10} /></Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleAvailability(c)}
                      className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${c.isAvailable ? 'bg-sage-light text-sage' : 'bg-cocoa-100 text-cocoa-400 dark:bg-cocoa-700'}`}
                    >
                      {c.isAvailable ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CakeFormModal cake={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
    </div>
  );
}

function CakeFormModal({ cake, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!cake?.id;

  useEffect(() => {
    if (!cake) return;
    setForm({
      ...EMPTY_FORM,
      ...cake,
      basePrice: String(cake.basePrice ?? ''),
      images: Array.isArray(cake.images) ? cake.images[0] || '' : (cake.images || ''),
      tags: Array.isArray(cake.tags) ? cake.tags.join(', ') : (cake.tags || '')
    });
  }, [cake]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.basePrice) {
      toast.error('Name and price are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        images: form.images ? [form.images] : [],
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };
      const saved = isEdit ? await cakeService.update(payload) : await cakeService.create(payload);
      onSaved(saved);
      toast.success(isEdit ? 'Cake updated.' : 'Cake added to the menu.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={!!cake} onClose={onClose} title={isEdit ? 'Edit Cake' : 'Add Cake'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required
              className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800">
              {CAKE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
            className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Base Price (₹)</label>
            <input type="number" min="0" step="1" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} required
              className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="chocolate, eggless"
              className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Photo</label>
          <input
            value={form.images} onChange={(e) => set('images', e.target.value)}
            placeholder="Paste an image URL (e.g. https://...)"
            className="mb-2 w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
          />
          <p className="mb-2 text-xs text-cocoa-400">Or upload a file instead — it'll fill the URL above automatically.</p>
          <FileUploadField value={form.images} onChange={(url) => set('images', url)} purpose="cake" />
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-medium text-cocoa-600 dark:text-blush-deep">
          {[
            ['isAvailable', 'Available for order'],
            ['isFeatured', 'Featured'],
            ['isBestSeller', 'Best Seller'],
            ['isTrending', 'Trending'],
            ['isSeasonal', 'Seasonal']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5">
              <input type="checkbox" checked={!!form[key]} onChange={(e) => set(key, e.target.checked)} className="accent-mulberry-500" />
              {label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-pill border border-cocoa-150 px-4 py-2 text-sm dark:border-cocoa-600">Cancel</button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-1.5 rounded-pill bg-mulberry-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Add Cake'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
