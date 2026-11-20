import { cn } from '@/themes/neobrutal/lib/utils';

export function GameIcon(props: {
  assets?: unknown;
  iconKey?: string;
  supabaseUrl?: string;
  alt?: string;
  className?: string;
}) {
  const { iconKey = '', alt = '', className } = props;
  const label = alt.trim();
  const key = iconKey.trim();
  const initial = (label[0] || key[0] || '?').toUpperCase();

  return (
    <div
      className={cn(
        'flex size-10 items-center justify-center border-2 border-border bg-muted font-bold text-foreground select-none',
        className,
      )}
      aria-label={label || key}
    >
      {initial}
    </div>
  );
}
