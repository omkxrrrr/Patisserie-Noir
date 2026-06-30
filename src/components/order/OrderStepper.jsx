import { Check } from 'lucide-react';
import clsx from 'clsx';

export default function OrderStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors',
                  isDone ? 'bg-sage text-white' : isActive ? 'bg-mulberry-500 text-white' : 'bg-cocoa-100 text-cocoa-400 dark:bg-cocoa-700'
                )}
              >
                {isDone ? <Check size={16} /> : stepNum}
              </div>
              <span className={clsx('whitespace-nowrap text-[11px] font-medium', isActive ? 'text-mulberry-600' : 'text-cocoa-400')}>{label}</span>
            </div>
            {stepNum !== steps.length && (
              <div className={clsx('mx-2 h-0.5 flex-1', isDone ? 'bg-sage' : 'bg-cocoa-100 dark:bg-cocoa-700')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
