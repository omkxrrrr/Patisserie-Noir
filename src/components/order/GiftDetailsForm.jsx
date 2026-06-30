import { useFormContext } from 'react-hook-form';

export default function GiftDetailsForm() {
  const { register, watch, formState: { errors } } = useFormContext();
  const isGift = watch('isGift');

  return (
    <div className="rounded-soft border border-cocoa-100 p-4 dark:border-cocoa-700">
      <label className="flex items-center gap-2.5 text-sm font-medium text-cocoa-700 dark:text-blush">
        <input type="checkbox" {...register('isGift')} className="h-4 w-4 accent-mulberry-500" />
        This is a gift for someone else
      </label>

      {isGift && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-cocoa-500">Recipient's Name</label>
            <input {...register('recipientName', { required: isGift })} className="w-full rounded-pill border border-cocoa-150 px-4 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
            {errors.recipientName && <p className="mt-1 text-xs text-red-500">Recipient name is required.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-cocoa-500">Recipient's Phone</label>
            <input {...register('recipientPhone', { required: isGift })} className="w-full rounded-pill border border-cocoa-150 px-4 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
            {errors.recipientPhone && <p className="mt-1 text-xs text-red-500">Recipient phone is required.</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-cocoa-500">Gift Message</label>
            <textarea {...register('giftMessage')} rows={2} className="w-full rounded-soft border border-cocoa-150 px-4 py-2 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />
          </div>
        </div>
      )}
    </div>
  );
}
