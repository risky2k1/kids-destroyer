'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { saveRolePermissions } from '../actions';
import type { PermissionGroup } from '../types';

export function PermissionMatrix({
  roleId,
  currentPermissions,
  groups,
}: {
  roleId: string;
  currentPermissions: string[];
  groups: PermissionGroup[];
}) {
  const [, formAction, pending] = useActionToast(saveRolePermissions, 'Đã lưu quyền');
  const heldSet = new Set(currentPermissions);
  const declaredKeys = new Set(groups.flatMap((g) => g.permissions.map((p) => p.key)));
  const extraKeys = currentPermissions.filter((k) => !declaredKeys.has(k));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="roleId" value={roleId} />
      {groups.map((group) => (
        <fieldset
          key={group.module}
          className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4 shadow-[2px_2px_0_0_var(--color-border)]"
        >
          <legend className="px-2 text-sm font-heading">{group.module}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.permissions.map((p) => (
              <label
                key={p.key}
                className="flex cursor-pointer items-start gap-2.5 rounded-base border border-border/20 bg-background p-2.5 hover:border-border/40"
              >
                <input
                  type="checkbox"
                  name="permission"
                  value={p.key}
                  defaultChecked={heldSet.has(p.key)}
                  className="mt-0.5 size-4 accent-main"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-base leading-tight text-foreground">{p.label}</span>
                  <code className="font-mono text-xs text-foreground/60">{p.key}</code>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {extraKeys.length > 0 && (
        <fieldset className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4 shadow-[2px_2px_0_0_var(--color-border)]">
          <legend className="px-2 text-sm font-heading">Khác</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {extraKeys.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 rounded-base border border-border/20 bg-background p-2.5 hover:border-border/40"
              >
                <input
                  type="checkbox"
                  name="permission"
                  value={key}
                  defaultChecked
                  className="mt-0.5 size-4 accent-main"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-base leading-tight text-foreground">{key}</span>
                  <code className="font-mono text-xs text-foreground/60">{key}</code>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          Lưu
        </Button>
      </div>
    </form>
  );
}
