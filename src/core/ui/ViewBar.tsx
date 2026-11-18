import type { ReactNode } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';

export function ViewBar({
  label,
  count,
  children,
  actions,
}: {
  label: string;
  count: number;
  children?: ReactNode;
  /** Extra controls shown before Lọc / Sắp xếp / Tuỳ chọn. */
  actions?: ReactNode;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border/10 px-3 text-[13px]">
      <span className="mr-auto inline-flex min-w-0 items-center gap-1.5">
        {children ?? (
          <>
            <LayoutGrid className="size-3.5" />
            Tất cả {label}
            <span className="text-foreground/60">· {count}</span>
            <ChevronDown className="size-3.5 text-foreground/60" />
          </>
        )}
      </span>
      {actions}
      <button type="button" className="text-foreground/60 hover:text-foreground">
        Lọc
      </button>
      <button type="button" className="text-foreground/60 hover:text-foreground">
        Sắp xếp
      </button>
      <button type="button" className="text-foreground/60 hover:text-foreground">
        Tuỳ chọn
      </button>
    </div>
  );
}
