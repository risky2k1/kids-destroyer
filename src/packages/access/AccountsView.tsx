import { UserCog } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { ViewBar } from '@/core/ui/ViewBar';
import { AccountsTable } from './components/AccountsTable';
import { listAccounts } from './queries';

export async function AccountsView() {
  const { accounts, roles } = await listAccounts();

  return (
    <>
      <PageHeader icon={UserCog} title="Tài khoản" />
      <ViewBar label="tài khoản" count={accounts.length} />
      <AccountsTable accounts={accounts} roles={roles} />
    </>
  );
}
