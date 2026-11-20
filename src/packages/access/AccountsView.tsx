import { UserCog } from 'lucide-react';
import { getCurrentUser } from '@/core/auth/session';
import { PageHeader } from '@/core/ui/PageHeader';
import { ViewBar } from '@/core/ui/ViewBar';
import { Button } from '@/themes/neobrutal/ui/button';
import { AccountsTable } from './components/AccountsTable';
import { CreateAccountDialog } from './components/CreateAccountDialog';
import { listAccounts } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function AccountsView() {
  const [{ accounts, roles }, currentUser] = await Promise.all([listAccounts(), getCurrentUser()]);

  return (
    <>
      <PageHeader
        icon={UserCog}
        title="Tài khoản"
        actions={
          <CreateAccountDialog roles={roles}>
            <Button type="button" size="sm" className={`h-7 border-2 ${hardShadow}`}>
              + Tạo tài khoản
            </Button>
          </CreateAccountDialog>
        }
      />
      <ViewBar label="tài khoản" count={accounts.length} />
      <AccountsTable accounts={accounts} roles={roles} currentUserId={currentUser?.id ?? ''} />
    </>
  );
}
