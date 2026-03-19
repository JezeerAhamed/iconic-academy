'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export type BillingPeriod = 'monthly' | 'annual';

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}

export default function BillingToggle({ value, onChange }: BillingToggleProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const options: BillingPeriod[] = ['monthly', 'annual'];

  const moveSelection = (nextIndex: number) => {
    const nextValue = options[nextIndex];
    onChange(nextValue);
    optionRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveSelection((currentIndex + 1) % options.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveSelection((currentIndex - 1 + options.length) % options.length);
        break;
      case 'Home':
        event.preventDefault();
        moveSelection(0);
        break;
      case 'End':
        event.preventDefault();
        moveSelection(options.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-cgray-200 bg-white p-1 shadow-card',
          'dark:border-white/10 dark:bg-slate-900'
        )}
        role="radiogroup"
        aria-label="Choose monthly or annual billing"
      >
        <button
          ref={(element) => {
            optionRefs.current[0] = element;
          }}
          type="button"
          role="radio"
          aria-checked={value === 'monthly'}
          tabIndex={value === 'monthly' ? 0 : -1}
          onClick={() => onChange('monthly')}
          onKeyDown={(event) => handleKeyDown(event, 0)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cblue-500 focus-visible:ring-offset-2',
            value === 'monthly'
              ? 'bg-cblue-500 text-white shadow-sm'
              : 'text-cgray-700 hover:bg-cgray-50 hover:text-cblue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          Monthly
        </button>
        <button
          ref={(element) => {
            optionRefs.current[1] = element;
          }}
          type="button"
          role="radio"
          aria-checked={value === 'annual'}
          tabIndex={value === 'annual' ? 0 : -1}
          onClick={() => onChange('annual')}
          onKeyDown={(event) => handleKeyDown(event, 1)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cblue-500 focus-visible:ring-offset-2',
            value === 'annual'
              ? 'bg-cblue-500 text-white shadow-sm'
              : 'text-cgray-700 hover:bg-cgray-50 hover:text-cblue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          Annual
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-200',
              value === 'annual'
                ? 'bg-white/20 text-white'
                : 'bg-cgreen-50 text-cgreen-600 dark:bg-green-500/15 dark:text-green-200'
            )}
          >
            Save 17%
          </span>
        </button>
      </div>

      <p className="text-sm text-cgray-600 dark:text-slate-300">
        Annual billing gives you 2 months free on paid plans.
      </p>
    </div>
  );
}
