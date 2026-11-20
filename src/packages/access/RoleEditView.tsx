import { notFound } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { PermissionMatrix } from './components/PermissionMatrix';
import { RoleRenameForm } from './components/RoleRenameForm';
import { getRole } from './queries';
import type { PermissionGroup } from './types';

export async function RoleEditView({ id, groups }: { id: string; groups: PermissionGroup[] }) {
  const role = await getRole(id);
  if (!role) notFound();

  return (
    <>
      <PageHeader
        icon={KeyRound}
        title={role.name}
        crumbs={[{ href: PATHS.admin.roles, label: 'Vai trò' }]}
      />
      <div className="grid gap-6 p-4 md:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-base border border-border/10 bg-main text-sm font-heading">
              {role.name.slice(0, 1)}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-heading">{role.name}</span>
              <code className="font-mono text-xs text-foreground/60">{role.id}</code>
            </div>
            {role.isSystem && (
              <Badge variant="neutral" className="ml-auto text-xs">
                Hệ thống
              </Badge>
            )}
          </div>
          {!role.isSystem && <RoleRenameForm role={role} />}
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          {role.id === 'super_admin' ? (
            <div className="rounded-base border border-border/10 bg-secondary-background p-4 text-sm text-foreground/60">
              Vai trò này luôn có mọi quyền
            </div>
          ) : (
            <PermissionMatrix
              roleId={role.id}
              currentPermissions={role.permissions}
              groups={groups}
            />
          )}
        </div>
      </div>
    </>
  );
}
