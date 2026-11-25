'use client';

import { Hash, KeyRound, Shield, ShieldCheck, Users } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { RecordTable } from '@/core/ui/RecordTable';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { deleteRole } from '../actions';
import type { RoleSummary } from '../queries';
import { CreateRoleDialog } from './CreateRoleDialog';

export function RolesTable({ roles }: { roles: RoleSummary[] }) {
  return (
    <RecordTable
      view={{ label: 'vai trò' }}
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: KeyRound,
          sortValue: (row) => row.name,
          filterValue: (row) => row.name,
          render: (row) => <span className="font-heading">{row.name}</span>,
        },
        {
          key: 'id',
          label: 'Mã',
          icon: Hash,
          sortValue: (row) => row.id,
          filterValue: (row) => row.id,
          render: (row) => <code className="font-mono text-xs">{row.id}</code>,
        },
        {
          key: 'permissions',
          label: 'Quyền',
          icon: ShieldCheck,
          sortValue: (row) =>
            row.id === 'super_admin' ? Number.MAX_SAFE_INTEGER : row.permissionCount,
          render: (row) => <span>{row.id === 'super_admin' ? 'Tất cả' : row.permissionCount}</span>,
        },
        {
          key: 'accounts',
          label: 'Tài khoản',
          icon: Users,
          sortValue: (row) => row.accountCount,
          render: (row) => <span>{row.accountCount}</span>,
        },
        {
          key: 'system',
          label: 'Hệ thống',
          icon: Shield,
          sortValue: (row) => (row.isSystem ? 1 : 0),
          filterValue: (row) => (row.isSystem ? 'Hệ thống' : 'Tuỳ chỉnh'),
          filterFacet: true,
          render: (row) =>
            row.isSystem ? (
              <Badge variant="neutral" className="text-xs">
                Hệ thống
              </Badge>
            ) : null,
        },
        {
          key: 'actions',
          label: '',
          icon: Shield,
          className: 'w-px',
          render: (row) =>
            !row.isSystem ? (
              <ConfirmDelete id={row.id} label={row.name} action={deleteRole} />
            ) : null,
        },
      ]}
      rows={roles}
      getId={(row) => row.id}
      getHref={(row) => PATHS.admin.role(row.id)}
      empty="Chưa có vai trò nào."
      addRow={
        <CreateRoleDialog>
          <button type="button" className="text-[13px] text-foreground/60 hover:text-foreground">
            + Thêm mới
          </button>
        </CreateRoleDialog>
      }
    />
  );
}
