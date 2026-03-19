'use client';

import { cn } from '@/lib/utils';

export type BillingPeriod = 'monthly' | 'annual';

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}

export default function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-cgray-200 bg-white p-1 shadow-card',
          'dark:border-white/10 dark:bg-slate-900'
        )}
        role="tablist"
        aria-label="Choose monthly or annual billing"
      >
        <button
          type="button"
          role="tab"
          aria-selected={value === 'monthly'}
          aria-pressed={value === 'monthly'}
          onClick={() => onChange('monthly')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
            value === 'monthly'
              ? 'bg-cblue-500 text-white shadow-sm'
              : 'text-cgray-700 hover:bg-cgray-50 hover:text-cblue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={value === 'annual'}
          aria-pressed={value === 'annual'}
          onClick={() => onChange('annual')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
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

      <p className="text-sm text-cgray-500 dark:text-slate-400">
        Annual billing gives you 2 months free on paid plans.
      </p>
    </div>
  );
}
