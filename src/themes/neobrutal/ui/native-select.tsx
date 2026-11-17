import * as React from 'react';
import { cn } from '@/themes/neobrutal/lib/utils';

/** Native <select>: works with FormData and the phone's own picker. */
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'rounded-base border-border bg-secondary-background text-foreground font-base flex h-10 w-full border-2 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-hidden disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
