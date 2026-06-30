import clsx from 'clsx';

export default function Badge({ children, className, tone = 'default' }) {
  const tones = {
    default: 'bg-cocoa-100 text-cocoa-600 dark:bg-cocoa-700 dark:text-blush-deep',
    gold: 'bg-gilt-100 text-gilt-600',
    mulberry: 'bg-mulberry-50 text-mulberry-600 dark:bg-mulberry-500/15 dark:text-mulberry-300',
    sage: 'bg-sage-light text-sage',
    danger: 'bg-red-100 text-red-600'
  };
  return (
    <span className={clsx('inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
