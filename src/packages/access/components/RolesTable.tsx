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
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: KeyRound,
          render: (row) => <span className="font-heading">{row.name}</span>,
        },
        {
          key: 'id',
          label: 'Mã',
          icon: Hash,
          render: (row) => <code className="font-mono text-xs">{row.id}</code>,
        },
        {
          key: 'permissions',
          label: 'Quyền',
          icon: ShieldCheck,
          render: (row) => <span>{row.id === 'super_admin' ? 'Tất cả' : row.permissionCount}</span>,
        },
        {
          key: 'accounts',
          label: 'Tài khoản',
          icon: Users,
          render: (row) => <span>{row.accountCount}</span>,
        },
        {
          key: 'system',
          label: 'Hệ thống',
          icon: Shield,
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
