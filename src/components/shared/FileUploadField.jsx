import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mediaService } from '../../services/mediaService';

export default function FileUploadField({ label, value, onChange, purpose = 'general', hint }) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large — please choose one under 5MB.');
      return;
    }
    setIsUploading(true);
    try {
      const result = await mediaService.upload(file, purpose);
      onChange(result.url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">{label}</label>}
      {hint && <p className="mb-2 text-xs text-cocoa-400">{hint}</p>}

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Uploaded" className="h-28 w-28 rounded-soft object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-cocoa-700 text-white"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-soft border-2 border-dashed border-cocoa-200 text-cocoa-400 transition-colors hover:border-mulberry-300 hover:text-mulberry-500 dark:border-cocoa-600">
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-[11px] font-medium">{isUploading ? 'Uploading…' : 'Upload photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}
