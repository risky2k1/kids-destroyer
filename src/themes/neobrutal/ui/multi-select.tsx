'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronsUpDown, Search, X } from 'lucide-react';

import { cn } from '@/themes/neobrutal/lib/utils';
import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
  prefix?: ReactNode;
  searchText?: string;
};

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

type Props = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  itemLabel?: string;
  className?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn mục…',
  searchPlaceholder = 'Tìm kiếm…',
  emptyText = 'Không tìm thấy mục nào.',
  itemLabel = 'mục',
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return options;
    return options.filter((o) => {
      const hay = fold(`${o.label} ${o.description ?? ''} ${o.searchText ?? ''}`);
      return hay.includes(q);
    });
  }, [options, query]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => selectedSet.has(o.value));

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      const drop = new Set(filtered.map((o) => o.value));
      onChange(value.filter((v) => !drop.has(v)));
    } else {
      const next = new Set(value);
      for (const o of filtered) next.add(o.value);
      onChange([...next]);
    }
  }

  const selectedOptions = value
    .map((v) => byValue.get(v))
    .filter((o): o is MultiSelectOption => Boolean(o));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <PopoverTrigger
          type="button"
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-1.5 text-left text-sm font-base text-foreground hover:bg-foreground/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <span className={cn('truncate', value.length === 0 && 'text-foreground/50')}>
            {value.length === 0 ? placeholder : `Đã chọn ${value.length} ${itemLabel}`}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-foreground/60" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] p-2.5">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-foreground/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
                autoFocus
              />
            </div>

            {options.length > 0 && (
              <div className="flex items-center justify-between gap-2 border-b-2 border-border/15 px-1 pb-1.5 text-xs">
                <button
                  type="button"
                  onClick={toggleAllFiltered}
                  className="font-heading text-foreground/80 underline hover:text-foreground"
                >
                  {allFilteredSelected
                    ? query.trim()
                      ? 'Bỏ chọn kết quả'
                      : 'Bỏ chọn tất cả'
                    : query.trim()
                      ? `Chọn tất cả kết quả (${filtered.length})`
                      : `Chọn tất cả (${options.length})`}
                </button>
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-foreground/60 hover:text-foreground"
                  >
                    Xóa hết ({value.length})
                  </button>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-foreground/60">{emptyText}</p>
            ) : (
              <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto pr-0.5">
                {filtered.map((opt) => {
                  const checked = selectedSet.has(opt.value);
                  return (
                    <li key={opt.value}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-base border-2 px-2.5 py-1.5 text-sm transition-colors',
                          checked
                            ? 'border-border bg-main/15 font-heading'
                            : 'border-transparent hover:bg-foreground/5',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(opt.value)}
                          aria-label={opt.label}
                        />
                        {opt.prefix && <span className="shrink-0">{opt.prefix}</span>}
                        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="shrink-0 text-xs font-base text-foreground/60">
                            {opt.description}
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex justify-end border-t-2 border-border/15 pt-2">
              <Button type="button" size="xs" onClick={() => setOpen(false)}>
                Xong ({value.length})
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.slice(0, 12).map((opt) => (
            <Badge key={opt.value} variant="neutral" className="gap-1 py-0.5 pr-1 text-xs">
              {opt.prefix}
              <span>{opt.label}</span>
              {opt.description && <span className="text-foreground/55">({opt.description})</span>}
              <button
                type="button"
                aria-label={`Bỏ chọn ${opt.label}`}
                onClick={() => toggle(opt.value)}
                className="ml-0.5 inline-flex size-4 items-center justify-center rounded-base hover:bg-foreground/15"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedOptions.length > 12 && (
            <Badge className="text-xs">
              +{selectedOptions.length - 12} {itemLabel} khác
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
