'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PricingFaqItem {
  question: string;
  answer: string;
}

export default function PricingFaqAccordion({ items }: { items: PricingFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleClose = (index: number) => {
    setOpenIndex(-1);
    window.requestAnimationFrame(() => triggerRefs.current[index]?.focus());
  };

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        const panelId = `pricing-faq-panel-${index}`;
        const buttonId = `pricing-faq-button-${index}`;

        return (
          <div key={item.question} className="border-b border-cgray-200 dark:border-white/10">
            <button
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && isOpen) {
                  event.preventDefault();
                  handleClose(index);
                }
              }}
              className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-cblue-500 focus-visible:ring-offset-2"
            >
              <span className="text-base font-semibold text-cgray-900 dark:text-slate-100">
                {item.question}
              </span>
              <span
                className={cn(
                  'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-cgray-200 text-cgray-500 transition-all duration-200 dark:border-white/10 dark:text-slate-400',
                  isOpen && 'rotate-180 border-cblue-200 bg-cblue-25 text-cblue-500 dark:border-cblue-400/30 dark:bg-cblue-500/10'
                )}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={cn(
                'grid overflow-hidden transition-all duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-4 text-base leading-relaxed text-cgray-600 dark:text-slate-300">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
