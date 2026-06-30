import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-mulberry-500 text-white hover:bg-mulberry-600 shadow-card',
  secondary: 'bg-cocoa-700 text-blush hover:bg-cocoa-600',
  outline: 'border border-cocoa-300 text-cocoa-700 hover:bg-cocoa-50 dark:border-cocoa-500 dark:text-blush dark:hover:bg-cocoa-700',
  ghost: 'text-cocoa-600 hover:bg-cocoa-100 dark:text-blush dark:hover:bg-cocoa-700',
  gold: 'bg-gilt text-cocoa-800 hover:bg-gilt-300 shadow-glow'
};

const SIZES = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base'
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, isLoading, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-wide transition-all',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'active:scale-[0.98]',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
