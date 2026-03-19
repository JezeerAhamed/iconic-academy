import { cn } from '@/lib/utils';

type EmojiIconProps = {
  emoji: string;
  label: string;
  className?: string;
  decorative?: boolean;
};

export default function EmojiIcon({
  emoji,
  label,
  className,
  decorative = false,
}: EmojiIconProps) {
  if (decorative) {
    return (
      <span aria-hidden="true" className={cn('inline-flex items-center justify-center', className)}>
        {emoji}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      {emoji}
    </span>
  );
}
