'use client';

import { House, KeyRound, Mail, Shield, UserRound } from 'lucide-react';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { RecordTable } from '@/core/ui/RecordTable';
import { deleteAccount } from '../actions';
import type { AccountSummary, RoleSummary } from '../queries';
import { AccountRoleForm } from './AccountRoleForm';
import { ResetPasswordDialog } from './ResetPasswordDialog';

export function AccountsTable({
  accounts,
  roles,
  currentUserId,
}: {
  accounts: AccountSummary[];
  roles: RoleSummary[];
  currentUserId: string;
}) {
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;

  return (
    <RecordTable
      view={{ label: 'tài khoản' }}
      columns={[
        {
          key: 'name',
          label: 'Tên',
          icon: UserRound,
          sortValue: (row) => row.displayName,
          filterValue: (row) => row.displayName,
          render: (row) => <span className="font-heading">{row.displayName}</span>,
        },
        {
          key: 'email',
          label: 'Email',
          icon: Mail,
          sortValue: (row) => row.email,
          filterValue: (row) => row.email,
          render: (row) => <span>{row.email || '—'}</span>,
        },
        {
          key: 'family',
          label: 'Gia đình',
          icon: House,
          sortValue: (row) => row.familyName,
          filterValue: (row) => row.familyName,
          filterFacet: true,
          render: (row) => <span>{row.familyName || '—'}</span>,
        },
        {
          key: 'role',
          label: 'Vai trò',
          icon: KeyRound,
          sortValue: (row) => roleName(row.roleId),
          filterValue: (row) => roleName(row.roleId),
          filterFacet: true,
          render: (row) => (
            <AccountRoleForm userId={row.id} currentRoleId={row.roleId} roles={roles} />
          ),
        },
        {
          key: 'actions',
          label: '',
          icon: Shield,
          className: 'w-px',
          render: (row) =>
            row.id !== currentUserId ? (
              <div className="flex items-center gap-1">
                <ResetPasswordDialog userId={row.id} displayName={row.displayName} />
                <ConfirmDelete id={row.id} label={row.displayName} action={deleteAccount} />
              </div>
            ) : null,
        },
      ]}
      rows={accounts}
      getId={(row) => row.id}
      addRow={<span />}
      empty="Chưa có tài khoản nào."
    />
  );
}
