import clsx from 'clsx';

export function SkeletonBlock({ className }) {
  return <div className={clsx('skeleton rounded-soft', className)} />;
}

export function CakeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-soft bg-white shadow-card dark:bg-cocoa-800">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
