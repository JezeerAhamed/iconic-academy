import EmojiIcon from '@/components/accessibility/EmojiIcon';
import { cn } from '@/lib/utils';

export default function EarlyAccessBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900',
        'dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100',
        className
      )}
    >
      <EmojiIcon emoji="🚀" label="Now enrolling" decorative />
      <span>Now enrolling — limited spots</span>
    </span>
  );
}
