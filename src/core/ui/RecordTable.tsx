'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { Checkbox } from '@/themes/neobrutal/ui/checkbox';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themes/neobrutal/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/themes/neobrutal/ui/table';
import { ViewBar } from './ViewBar';
import {
  applyRecordTableView,
  buildFacetOptions,
  type SortState,
  type TableColumnMeta,
} from './recordTableView';

const rowClass =
  'group/row h-8 border-0! bg-transparent font-base text-foreground hover:bg-foreground/[0.03] data-[state=selected]:bg-foreground/[0.04]! data-[state=selected]:text-foreground!';
const headClass =
  'h-8 border-b border-r border-border/10 px-2 py-0 text-left text-[13px] font-base text-foreground/60';
const cellClass = 'h-8 border-b border-r border-border/10 px-2 py-0 text-[13px] whitespace-nowrap';
const checkClass = 'size-3.5 rounded-sm outline-1 outline-border/40';
const ALL_OPTION = '__all__';

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

export type Column<T> = TableColumnMeta<T> & {
  icon: LucideIcon;
  className?: string;
  render: (row: T) => ReactNode;
};

export type RecordTableViewConfig<T> = {
  label: string;
  header?: ReactNode;
  actions?: ReactNode;
  defaultSort?: SortState;
  extraFilter?: {
    activeCount?: number;
    content: ReactNode;
    match: (row: T) => boolean;
    onReset?: () => void;
  };
};

export function RecordTable<T>({
  columns,
  rows,
  getId,
  getHref,
  addRow,
  empty,
  view,
}: {
  columns: Column<T>[];
  rows: T[];
  getId: (row: T) => string;
  getHref?: (row: T) => string;
  addRow?: ReactNode;
  empty?: string;
  view?: RecordTableViewConfig<T>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [search, setSearch] = useState('');
  const [facets, setFacets] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>(view?.defaultSort ?? null);
  const [hiddenCols, setHiddenCols] = useState<ReadonlySet<string>>(new Set());

  const searchableCols = useMemo(() => columns.filter((c) => c.filterValue), [columns]);
  const facetCols = useMemo(
    () =>
      columns
        .filter((c) => c.filterFacet && c.filterValue)
        .map((c) => ({ col: c, options: buildFacetOptions(rows, c) }))
        .filter((f) => f.options.length > 0),
    [columns, rows],
  );
  const sortableCols = useMemo(() => columns.filter((c) => c.sortValue && c.label), [columns]);
  const hideableCols = useMemo(
    () => columns.filter((c) => c.label !== '' && c.hideable !== false),
    [columns],
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
  );

  const shownRows = useMemo(
    () =>
      view
        ? applyRecordTableView(rows, columns, {
            search,
            facets,
            sort,
            extraMatch: view.extraFilter?.match,
          })
        : rows,
    [view, rows, columns, search, facets, sort],
  );

  const ids = shownRows.map(getId);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = ids.some((id) => selected.has(id));
  const span = Math.max(visibleColumns.length, 1);

  const activeFacetCount = Object.values(facets).filter(Boolean).length;
  const activeFilterCount =
    (search.trim() ? 1 : 0) + activeFacetCount + (view?.extraFilter?.activeCount ?? 0);
  const activeSortCol = sort ? sortableCols.find((c) => c.key === sort.key) : undefined;
  const canFilter = searchableCols.length > 0 || facetCols.length > 0 || Boolean(view?.extraFilter);

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

  function resetFilters() {
    setSearch('');
    setFacets({});
    view?.extraFilter?.onReset?.();
  }

  function toggleColumn(key: string, visible: boolean) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      {view && (
        <ViewBar
          label={view.label}
          count={shownRows.length}
          actions={view.actions}
          filter={
            canFilter
              ? {
                  active: activeFilterCount > 0,
                  label: activeFilterCount > 0 ? `Lọc (${activeFilterCount})` : 'Lọc',
                  content: (
                    <div className="flex flex-col gap-3">
                      {searchableCols.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`search-${view.label}`} className="text-xs">
                            Tìm nhanh
                          </Label>
                          <Input
                            id={`search-${view.label}`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nhập từ khóa…"
                            className="h-9"
                          />
                        </div>
                      )}
                      {facetCols.map(({ col, options }) => {
                        const val = facets[col.key] ?? '';
                        const activeLabel = options.find((o) => o.value === val)?.label ?? 'Tất cả';
                        return (
                          <div key={col.key} className="flex flex-col gap-1">
                            <Label className="text-xs">{col.label}</Label>
                            <Select
                              value={val || ALL_OPTION}
                              onValueChange={(next) =>
                                setFacets((prev) => ({
                                  ...prev,
                                  [col.key]: !next || next === ALL_OPTION ? '' : next,
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 bg-secondary-background text-foreground">
                                <SelectValue>{val ? activeLabel : 'Tất cả'}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_OPTION}>Tất cả</SelectItem>
                                {options.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                      {view.extraFilter?.content}
                      {activeFilterCount > 0 && (
                        <Button type="button" size="xs" variant="neutral" onClick={resetFilters}>
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  ),
                }
              : undefined
          }
          sort={
            sortableCols.length > 0
              ? {
                  active: Boolean(activeSortCol),
                  label: activeSortCol
                    ? `${activeSortCol.label} ${sort!.dir === 'asc' ? '↑' : '↓'}`
                    : 'Sắp xếp',
                  content: (
                    <div className="flex flex-col gap-1">
                      <span className="px-1 pb-1 text-xs font-heading uppercase text-foreground/60">
                        Sắp xếp theo
                      </span>
                      {sortableCols.map((col) => {
                        const isActive = sort?.key === col.key;
                        return (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() =>
                              setSort((prev) =>
                                prev?.key === col.key
                                  ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                                  : { key: col.key, dir: 'asc' },
                              )
                            }
                            className={`flex items-center justify-between rounded-base border-2 px-2.5 py-1.5 text-left text-sm ${
                              isActive
                                ? 'border-border bg-main font-heading text-main-foreground'
                                : 'border-transparent hover:bg-foreground/5'
                            }`}
                          >
                            <span>{col.label}</span>
                            {isActive &&
                              (sort!.dir === 'asc' ? (
                                <ArrowUp className="size-3.5" />
                              ) : (
                                <ArrowDown className="size-3.5" />
                              ))}
                          </button>
                        );
                      })}
                      {sort && (
                        <Button
                          type="button"
                          size="xs"
                          variant="neutral"
                          onClick={() => setSort(null)}
                          className="mt-1"
                        >
                          Bỏ sắp xếp
                        </Button>
                      )}
                    </div>
                  ),
                }
              : undefined
          }
          options={
            hideableCols.length > 0
              ? {
                  active: hiddenCols.size > 0,
                  label: hiddenCols.size > 0 ? `Tuỳ chọn (ẩn ${hiddenCols.size})` : 'Tuỳ chọn',
                  content: (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-heading uppercase text-foreground/60">
                        Hiển thị cột
                      </span>
                      {hideableCols.map((col) => (
                        <label
                          key={col.key}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={!hiddenCols.has(col.key)}
                            onCheckedChange={(checked) => toggleColumn(col.key, checked)}
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                      {hiddenCols.size > 0 && (
                        <Button
                          type="button"
                          size="xs"
                          variant="neutral"
                          onClick={() => setHiddenCols(new Set())}
                        >
                          Hiện tất cả cột
                        </Button>
                      )}
                    </div>
                  ),
                }
              : undefined
          }
        >
          {view.header}
        </ViewBar>
      )}
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
            {visibleColumns.map((column) => {
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
          {shownRows.length === 0 && empty ? (
            <TableRow className={rowClass}>
              <TableCell className={cellClass} />
              <TableCell className={`${cellClass} text-foreground/60`} colSpan={span}>
                {empty}
              </TableCell>
            </TableRow>
          ) : null}
          {shownRows.map((row) => {
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
                {visibleColumns.map((column) => (
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
                Tổng: <b className="font-heading text-foreground">{shownRows.length}</b>
              </span>
            </TableCell>
            {visibleColumns.slice(1).map((column) => (
              <TableCell key={column.key} className={cellClass} />
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
