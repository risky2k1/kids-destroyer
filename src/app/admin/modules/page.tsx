import type { ModuleManifest } from '@/core/modules';
import { PACKAGES } from '@/packages/registry';
import { ModulesView, type ModuleSummary } from '@/packages/modules';
import { PLUGINS } from '@/plugins/registry';

function toSummary(m: ModuleManifest): ModuleSummary {
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    version: m.version,
    permissionCount: m.permissions.length,
    navCount: m.nav.length,
  };
}

export default function ModulesPage() {
  const plugins = PLUGINS.map(toSummary);
  const packages = PACKAGES.map(toSummary);
  return <ModulesView plugins={plugins} packages={packages} />;
}
