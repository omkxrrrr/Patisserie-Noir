import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';
import { contentService } from '../../services/adminServices';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/format';

const EMPTY_FORM = {
  id: null, title: '', excerpt: '', content: '', coverImage: '',
  metaTitle: '', metaDescription: '', isPublished: false
};

export default function Content() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  function load() {
    setIsLoading(true);
    contentService.adminListBlogPosts()
      .then(setPosts)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  function handleSaved() {
    setEditing(null);
    contentService.invalidateAll();
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Marketing</p>
          <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">Cake Journal</h1>
        </div>
        <button
          onClick={() => setEditing(EMPTY_FORM)}
          className="flex items-center gap-1.5 rounded-pill bg-mulberry-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} /> New Article
        </button>
      </div>

      <div className="overflow-x-auto rounded-soft bg-white shadow-card dark:bg-cocoa-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs uppercase tracking-wide text-cocoa-400 dark:border-cocoa-700">
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50 dark:divide-cocoa-700">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={3} />)
            ) : posts.length === 0 ? (
              <tr><td colSpan={3} className="p-0"><EmptyState title="No articles yet" description="Write your first Cake Journal article using the button above." /></td></tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} onClick={() => setEditing(p)} className="cursor-pointer hover:bg-cocoa-50/60 dark:hover:bg-cocoa-700/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.coverImage || '/cake-placeholder.svg'} alt="" className="h-10 w-10 rounded-soft object-cover" />
                      <p className="font-medium text-cocoa-700 dark:text-blush">{p.title || '(untitled)'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.isPublished ? 'sage' : 'default'}>{p.isPublished ? 'Published' : 'Draft'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-cocoa-600 dark:text-blush-deep">
                    {p.isPublished && p.publishedAt ? formatDate(p.publishedAt) : formatDate(p.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PostFormModal post={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
    </div>
  );
}

function PostFormModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!post?.id;

  useEffect(() => {
    if (!post) return;
    setForm({ ...EMPTY_FORM, ...post });
  }, [post]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit) {
        await contentService.updateBlogPost(form);
      } else {
        await contentService.createBlogPost(form);
      }
      onSaved();
      toast.success(isEdit ? 'Article updated.' : 'Article created.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={!!post} onClose={onClose} title={isEdit ? 'Edit Article' : 'New Article'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Title</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} required
            className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Cover Image URL</label>
          <input value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} placeholder="https://..."
            className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
          {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 h-24 w-24 rounded-soft object-cover" />}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Excerpt</label>
          <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2}
            placeholder="A short teaser shown on the journal list page"
            className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Content</label>
          <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={10} required
            placeholder="Full article text. Line breaks are preserved as written."
            className="w-full rounded-soft border border-cocoa-150 px-3 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
        </div>

        <label className="flex items-center gap-1.5 text-xs font-medium text-cocoa-600 dark:text-blush-deep">
          <input type="checkbox" checked={!!form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} className="accent-mulberry-500" />
          Published (visible on the public Cake Journal)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-pill border border-cocoa-150 px-4 py-2 text-sm dark:border-cocoa-600">Cancel</button>
          <button type="submit" disabled={isSaving} className="flex items-center gap-1.5 rounded-pill bg-mulberry-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Create Article'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
