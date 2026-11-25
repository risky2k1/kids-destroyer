'use client';

import type { ReactNode } from 'react';
import { ArrowUpDown, ChevronDown, Filter, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/themes/neobrutal/ui/popover';

export type ViewBarControl = {
  active?: boolean;
  label?: string;
  content: ReactNode;
};

function ToolbarPopover({
  defaultLabel,
  icon,
  control,
}: {
  defaultLabel: string;
  icon: ReactNode;
  control: ViewBarControl;
}) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={`inline-flex h-6.5 items-center gap-1 rounded-base border px-2 text-xs transition-colors ${
          control.active
            ? 'border-border bg-main font-heading text-main-foreground'
            : 'border-transparent text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
        }`}
      >
        {icon}
        <span>{control.label ?? defaultLabel}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        {control.content}
      </PopoverContent>
    </Popover>
  );
}

export function ViewBar({
  label,
  count,
  children,
  actions,
  filter,
  sort,
  options,
}: {
  label: string;
  count: number;
  children?: ReactNode;
  /** Extra controls shown before Lọc / Sắp xếp / Tuỳ chọn. */
  actions?: ReactNode;
  filter?: ViewBarControl;
  sort?: ViewBarControl;
  options?: ViewBarControl;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/10 px-3 text-[13px]">
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
      {filter && (
        <ToolbarPopover defaultLabel="Lọc" icon={<Filter className="size-3" />} control={filter} />
      )}
      {sort && (
        <ToolbarPopover
          defaultLabel="Sắp xếp"
          icon={<ArrowUpDown className="size-3" />}
          control={sort}
        />
      )}
      {options && (
        <ToolbarPopover
          defaultLabel="Tuỳ chọn"
          icon={<SlidersHorizontal className="size-3" />}
          control={options}
        />
      )}
    </div>
  );
}
