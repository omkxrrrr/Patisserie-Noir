import { Construction } from 'lucide-react';

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-soft border border-dashed border-cocoa-200 bg-white/50 p-12 text-center dark:border-cocoa-600 dark:bg-cocoa-800/40">
      <Construction className="mb-4 h-8 w-8 text-gilt" />
      <h2 className="font-display text-xl text-cocoa-700 dark:text-blush">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-cocoa-400">
        {description || 'This part of the admin panel is scoped for the next build phase and isn\'t wired up yet.'}
      </p>
    </div>
  );
}
