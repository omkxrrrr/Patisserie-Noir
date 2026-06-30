export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-soft border border-dashed border-cocoa-200 bg-white/40 px-6 py-16 text-center dark:border-cocoa-600 dark:bg-cocoa-800/30">
      {Icon && <Icon className="mb-4 h-8 w-8 text-cocoa-300" />}
      <h3 className="font-display text-lg text-cocoa-700 dark:text-blush">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-cocoa-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
