import { MODULES } from '@/app/_chrome/adminNav';
import { RoleEditView } from '@/packages/access';

export default async function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const groups = MODULES.filter((m) => m.permissions.length).map((m) => ({
    module: m.name,
    permissions: m.permissions,
  }));
  return <RoleEditView id={id} groups={groups} />;
}
