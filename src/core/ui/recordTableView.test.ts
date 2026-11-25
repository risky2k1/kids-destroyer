import { describe, expect, it } from 'vitest';
import { applyRecordTableView, buildFacetOptions, type TableColumnMeta } from './recordTableView';

type Row = { id: string; name: string; group: string; score: number | null; tags: string[] };

const columns: TableColumnMeta<Row>[] = [
  { key: 'name', label: 'Tên', sortValue: (r) => r.name, filterValue: (r) => r.name },
  {
    key: 'group',
    label: 'Nhóm',
    sortValue: (r) => r.group,
    filterValue: (r) => r.group,
    filterFacet: true,
  },
  { key: 'score', label: 'Điểm', sortValue: (r) => r.score },
  { key: 'tags', label: 'Nhãn', filterValue: (r) => r.tags, filterFacet: true },
];

const rows: Row[] = [
  { id: '1', name: 'Bún Bò', group: 'Trưa', score: 4.5, tags: ['Nước', 'Cay'] },
  { id: '2', name: 'An Cơm', group: 'Trưa', score: null, tags: ['Cơm'] },
  { id: '3', name: 'Ốc Đêm', group: 'Đêm', score: 3.0, tags: ['Nướng'] },
];

describe('buildFacetOptions', () => {
  it('collects unique sorted facet values from array and scalar columns', () => {
    expect(buildFacetOptions(rows, columns[1])).toEqual([
      { value: 'Đêm', label: 'Đêm' },
      { value: 'Trưa', label: 'Trưa' },
    ]);
    expect(buildFacetOptions(rows, columns[3])).toEqual([
      { value: 'Cay', label: 'Cay' },
      { value: 'Cơm', label: 'Cơm' },
      { value: 'Nước', label: 'Nước' },
      { value: 'Nướng', label: 'Nướng' },
    ]);
  });
});

describe('applyRecordTableView', () => {
  it('filters by text search across filterable columns and by facets', () => {
    expect(
      applyRecordTableView(rows, columns, { search: 'cay', facets: {}, sort: null }).map(
        (r) => r.id,
      ),
    ).toEqual(['1']);
    expect(
      applyRecordTableView(rows, columns, {
        search: '',
        facets: { group: 'Trưa' },
        sort: null,
      }).map((r) => r.id),
    ).toEqual(['1', '2']);
  });

  it('sorts ascending and descending while keeping null/empty values last', () => {
    expect(
      applyRecordTableView(rows, columns, {
        search: '',
        facets: {},
        sort: { key: 'name', dir: 'asc' },
      }).map((r) => r.id),
    ).toEqual(['2', '1', '3']);

    expect(
      applyRecordTableView(rows, columns, {
        search: '',
        facets: {},
        sort: { key: 'score', dir: 'desc' },
      }).map((r) => r.id),
    ).toEqual(['1', '3', '2']);
  });

  it('applies extraMatch predicate when provided', () => {
    expect(
      applyRecordTableView(rows, columns, {
        search: '',
        facets: {},
        sort: null,
        extraMatch: (r) => r.group === 'Đêm',
      }).map((r) => r.id),
    ).toEqual(['3']);
  });
});
