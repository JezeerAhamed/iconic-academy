const trustBadges = [
  {
    label: 'Stripe Secured',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M12 15v2" />
      </svg>
    ),
  },
  {
    label: 'SSL Encrypted',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 5 6v6c0 4.2 2.7 8 7 9 4.3-1 7-4.8 7-9V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7L14.8 10" />
      </svg>
    ),
  },
  {
    label: 'Cancel Anytime',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 12a9 9 0 0 1 15.4-6.3L21 8" />
        <path d="M21 12a9 9 0 0 1-15.4 6.3L3 16" />
        <path d="M21 3v5h-5" />
        <path d="M3 21v-5h5" />
      </svg>
    ),
  },
  {
    label: '7-Day Refund',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m20 6-11 11-5-5" />
      </svg>
    ),
  },
];

export default function PaymentTrustBadges() {
  return (
    <div className="mt-8 border-t border-cgray-200 pt-5 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-cgray-500 dark:text-slate-400">
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className="inline-flex items-center gap-2 rounded-full border border-cgray-200 bg-cgray-50 px-3 py-2 dark:border-white/10 dark:bg-slate-900"
          >
            <span className="text-cgray-500 dark:text-slate-400">{badge.icon}</span>
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
