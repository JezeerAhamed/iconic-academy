'use client';

import { useEffect, useMemo, useState } from 'react';

const SESSION_STORAGE_KEY = 'iconic-pricing-urgency-banner-dismissed';
const EXAM_DATE = new Date('2026-11-16T00:00:00+05:30');

function getTimeState() {
  const now = new Date();
  const difference = EXAM_DATE.getTime() - now.getTime();
  const safeDifference = Math.max(0, difference);
  const daysRemaining = Math.max(0, Math.ceil(safeDifference / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4375));

  return { daysRemaining, monthsRemaining, hasEnded: difference <= 0 };
}

export default function PricingUrgencyBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [timeState, setTimeState] = useState(getTimeState);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(SESSION_STORAGE_KEY) === '1';
    setDismissed(isDismissed);
    setTimeState(getTimeState());

    const interval = window.setInterval(() => {
      setTimeState(getTimeState());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const countdownLabel = useMemo(() => {
    if (timeState.daysRemaining === 1) {
      return '1 day left';
    }

    return `${timeState.daysRemaining} days left`;
  }, [timeState.daysRemaining]);

  if (dismissed || timeState.hasEnded) {
    return null;
  }

  return (
    <div className="sticky top-16 z-[90] border-b border-amber-200 bg-amber-50/95 backdrop-blur supports-[backdrop-filter]:bg-amber-50/85 dark:border-amber-400/20 dark:bg-amber-500/10">
      <div className="c-wrap flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2 1 21h22L12 2Zm1 14h-2v-2h2v2Zm0-4h-2V8h2v4Z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              2026 A/L exam in {timeState.monthsRemaining} months — lock in your plan today
            </p>
            <p className="text-sm text-amber-800/80 dark:text-amber-100/80">
              Countdown to the November 16, 2026 exam window.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-slate-950 dark:text-amber-100">
            {countdownLabel}
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
              setDismissed(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-400/15 dark:hover:text-white"
            aria-label="Dismiss urgency banner"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
