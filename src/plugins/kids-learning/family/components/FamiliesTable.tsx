'use client';

import { Baby, GraduationCap, House, UserRound } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { Chips, RecordTable } from '@/core/ui/RecordTable';
import type { FamilyRow } from '../lib/familyRow';
import { CreateFamilyDialog } from './CreateFamilyDialog';

export function FamiliesTable({ families }: { families: FamilyRow[] }) {
  return (
    <RecordTable
      view={{ label: 'gia đình' }}
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: House,
          sortValue: (row) => row.name,
          filterValue: (row) => row.name,
          render: (row) => <span className="font-heading">{row.name}</span>,
        },
        {
          key: 'parents',
          label: 'Phụ huynh',
          icon: UserRound,
          filterValue: (row) => row.parents,
          render: (row) => <Chips items={row.parents} />,
        },
        {
          key: 'kids',
          label: 'Các bé',
          icon: Baby,
          filterValue: (row) => row.kids,
          render: (row) => <Chips items={row.kids} />,
        },
        {
          key: 'grades',
          label: 'Lớp',
          icon: GraduationCap,
          filterValue: (row) => row.grades,
          filterFacet: true,
          render: (row) => <Chips items={row.grades} />,
        },
      ]}
      rows={families}
      getId={(row) => row.id}
      getHref={(row) => PATHS.admin.family(row.id)}
      empty="Chưa có gia đình nào."
      addRow={
        <CreateFamilyDialog>
          <button type="button" className="text-[13px] text-foreground/60">
            + Thêm mới
          </button>
        </CreateFamilyDialog>
      }
    />
  );
}
