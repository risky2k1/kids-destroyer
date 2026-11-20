'use client';

import { House, KeyRound, UserRound } from 'lucide-react';
import { RecordTable } from '@/core/ui/RecordTable';
import type { AccountSummary, RoleSummary } from '../queries';
import { AccountRoleForm } from './AccountRoleForm';

export function AccountsTable({
  accounts,
  roles,
}: {
  accounts: AccountSummary[];
  roles: RoleSummary[];
}) {
  return (
    <RecordTable
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: UserRound,
          render: (row) => <span className="font-heading">{row.displayName}</span>,
        },
        {
          key: 'family',
          label: 'Gia đình',
          icon: House,
          render: (row) => <span>{row.familyName || '—'}</span>,
        },
        {
          key: 'role',
          label: 'Vai trò',
          icon: KeyRound,
          render: (row) => (
            <AccountRoleForm userId={row.id} currentRoleId={row.roleId} roles={roles} />
          ),
        },
      ]}
      rows={accounts}
      getId={(row) => row.id}
      addRow={<span />}
      empty="Chưa có tài khoản nào."
    />
  );
}
