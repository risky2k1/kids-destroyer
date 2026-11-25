export type SortDirection = 'asc' | 'desc';

export type SortState = {
  key: string;
  dir: SortDirection;
} | null;

export type SortableValue = string | number | boolean | null | undefined;
export type FilterableValue = string | string[] | null | undefined;

export type FacetOption = { value: string; label: string };

export type TableColumnMeta<T> = {
  key: string;
  label: string;
  sortValue?: (row: T) => SortableValue;
  filterValue?: (row: T) => FilterableValue;
  filterFacet?: boolean | FacetOption[];
  hideable?: boolean;
};

export function toFilterArray(value: FilterableValue): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
  const s = value.trim();
  return s ? [s] : [];
}

/** Extracts sorted unique facet options from rows when `filterFacet: true`. */
export function buildFacetOptions<T>(
  rows: T[],
  col: Pick<TableColumnMeta<T>, 'filterValue' | 'filterFacet'>,
): FacetOption[] {
  if (!col.filterFacet || !col.filterValue) return [];
  if (Array.isArray(col.filterFacet)) return col.filterFacet;
  const set = new Set<string>();
  for (const row of rows) {
    for (const val of toFilterArray(col.filterValue(row))) set.add(val);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'vi')).map((v) => ({ value: v, label: v }));
}

function compareValues(a: SortableValue, b: SortableValue): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), 'vi', { numeric: true });
}

export function applyRecordTableView<T>(
  rows: T[],
  columns: TableColumnMeta<T>[],
  options: {
    search: string;
    facets: Record<string, string>;
    sort: SortState;
    extraMatch?: (row: T) => boolean;
  },
): T[] {
  const q = options.search.trim().toLowerCase();
  const searchableCols = columns.filter((c) => c.filterValue);
  const activeFacets = Object.entries(options.facets).filter(([, v]) => v !== '');

  const filtered = rows.filter((row) => {
    if (options.extraMatch && !options.extraMatch(row)) return false;

    for (const [colKey, wanted] of activeFacets) {
      const col = columns.find((c) => c.key === colKey);
      if (!col?.filterValue) continue;
      const values = toFilterArray(col.filterValue(row));
      if (!values.includes(wanted)) return false;
    }

    if (q && searchableCols.length > 0) {
      const hit = searchableCols.some((col) =>
        toFilterArray(col.filterValue!(row)).some((v) => v.toLowerCase().includes(q)),
      );
      if (!hit) return false;
    }

    return true;
  });

  if (!options.sort) return filtered;
  const sortCol = columns.find((c) => c.key === options.sort!.key);
  if (!sortCol?.sortValue) return filtered;

  const dir = options.sort.dir === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => {
    const va = sortCol.sortValue!(a);
    const vb = sortCol.sortValue!(b);
    // Keep missing/empty values at the bottom even in descending order.
    const aEmpty = va === null || va === undefined || va === '';
    const bEmpty = vb === null || vb === undefined || vb === '';
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;
    return compareValues(va, vb) * dir;
  });
}
