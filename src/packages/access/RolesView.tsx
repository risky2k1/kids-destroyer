import { KeyRound } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { ViewBar } from '@/core/ui/ViewBar';
import { Button } from '@/themes/neobrutal/ui/button';
import { CreateRoleDialog } from './components/CreateRoleDialog';
import { RolesTable } from './components/RolesTable';
import { listRoles } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function RolesView() {
  const roles = await listRoles();

  return (
    <>
      <PageHeader
        icon={KeyRound}
        title="Vai trò"
        actions={
          <CreateRoleDialog>
            <Button type="button" size="sm" className={`h-7 border-2 ${hardShadow}`}>
              + Tạo
            </Button>
          </CreateRoleDialog>
        }
      />
      <ViewBar label="vai trò" count={roles.length} />
      <RolesTable roles={roles} />
    </>
  );
}
