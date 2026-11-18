'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/themes/neobrutal/ui/table';

const rowClass =
  'group/row h-8 border-0! bg-transparent font-base text-foreground hover:bg-foreground/[0.03] data-[state=selected]:bg-foreground/[0.04]! data-[state=selected]:text-foreground!';
const headClass =
  'h-8 border-b border-r border-border/10 px-2 py-0 text-left text-[13px] font-base text-foreground/60';
const cellClass = 'h-8 border-b border-r border-border/10 px-2 py-0 text-[13px] whitespace-nowrap';
const checkClass = 'size-3.5 rounded-sm outline-1 outline-border/40';

export function Chips({ items }: { items: string[] }) {
  return (
    <span className="inline-flex flex-nowrap items-center gap-1">
      {items.map((item, index) => (
        <Badge
          key={`${item}-${index}`}
          className="rounded-sm! border! border-border/15! bg-foreground/5 px-1.5 py-0 font-base shadow-none"
        >
          {item}
        </Badge>
      ))}
    </span>
  );
}

type Column<T> = {
  key: string;
  label: string;
  icon: LucideIcon;
  className?: string;
  render: (row: T) => ReactNode;
};

export function RecordTable<T>({
  columns,
  rows,
  getId,
  getHref,
  addRow,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  getId: (row: T) => string;
  getHref?: (row: T) => string;
  addRow?: ReactNode;
  empty?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const ids = rows.map(getId);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = ids.some((id) => selected.has(id));
  const span = Math.max(columns.length, 1);

  function setAll(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function setOne(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <Table className="w-max min-w-full border-0! bg-secondary-background text-sm">
      <TableHeader className="[&_tr]:border-b-0!">
        <TableRow className={rowClass}>
          <TableHead className={`${headClass} w-8`}>
            <Checkbox
              aria-label="Chọn tất cả"
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              className={checkClass}
              onCheckedChange={setAll}
            />
          </TableHead>
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <TableHead key={column.key} className={`${headClass} ${column.className ?? ''}`}>
                <span className="inline-flex items-center gap-1.5">
                  {column.label ? <Icon className="size-3.5" /> : null}
                  {column.label}
                </span>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && empty ? (
          <TableRow className={rowClass}>
            <TableCell className={cellClass} />
            <TableCell className={`${cellClass} text-foreground/60`} colSpan={span}>
              {empty}
            </TableCell>
          </TableRow>
        ) : null}
        {rows.map((row) => {
          const id = getId(row);
          const href = getHref?.(row);
          return (
            <TableRow
              key={id}
              className={`${rowClass}${href ? ' cursor-pointer' : ''}`}
              data-state={selected.has(id) ? 'selected' : undefined}
              tabIndex={href ? 0 : undefined}
              onClick={href ? () => router.push(href) : undefined}
              onKeyDown={
                href
                  ? (event) => {
                      if (event.key === 'Enter') router.push(href);
                    }
                  : undefined
              }
            >
              <TableCell
                className={cellClass}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Checkbox
                  aria-label="Chọn dòng"
                  checked={selected.has(id)}
                  className={checkClass}
                  onCheckedChange={(checked) => setOne(id, checked)}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.key} className={`${cellClass} ${column.className ?? ''}`}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
        <TableRow className={rowClass}>
          <TableCell className={cellClass} />
          <TableCell className={cellClass} colSpan={span}>
            {addRow ?? (
              <button type="button" className="text-[13px] text-foreground/60">
                + Thêm mới
              </button>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter className="border-t! border-t-border/10! bg-transparent font-base text-foreground/60">
        <TableRow className={rowClass}>
          <TableCell className={cellClass} />
          <TableCell className={cellClass}>
            <span className="text-[13px] text-foreground/60">
              Tổng: <b className="font-heading text-foreground">{rows.length}</b>
            </span>
          </TableCell>
          {columns.slice(1).map((column) => (
            <TableCell key={column.key} className={cellClass} />
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
}
