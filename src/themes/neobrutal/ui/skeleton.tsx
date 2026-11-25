import { cn } from '@/themes/neobrutal/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-base bg-foreground/10', className)}
      {...props}
    />
  );
}

export { Skeleton };
