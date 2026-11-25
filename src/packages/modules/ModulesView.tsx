import { Blocks } from 'lucide-react';
import { disabledModules } from '@/core/modules/server';
import { PageHeader } from '@/core/ui/PageHeader';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { ModuleToggleForm } from './components/ModuleToggleForm';
import type { ModuleSummary } from './types';

export async function ModulesView({
  plugins,
  packages,
}: {
  plugins: ModuleSummary[];
  packages: ModuleSummary[];
}) {
  const disabled = await disabledModules();

  return (
    <>
      <PageHeader icon={Blocks} title="Plugin" />
      <div className="space-y-6 p-4">
        <section className="space-y-3">
          <h2 className="text-sm font-heading text-foreground/80">Plugin tính năng</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {plugins.map((plugin) => {
              const isEnabled = !disabled.includes(plugin.id);
              return (
                <Card key={plugin.id} size="sm">
                  <CardHeader className="flex-row items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">{plugin.name}</CardTitle>
                        <span className="font-mono text-xs text-foreground/60">
                          v{plugin.version}
                        </span>
                        <Badge variant={isEnabled ? 'default' : 'neutral'}>
                          {isEnabled ? 'Đang bật' : 'Đã tắt'}
                        </Badge>
                      </div>
                      <CardDescription>{plugin.description}</CardDescription>
                      <div className="text-xs text-foreground/60">
                        {plugin.permissionCount} quyền · {plugin.navCount} mục menu
                      </div>
                    </div>
                    <ModuleToggleForm id={plugin.id} enabled={isEnabled} />
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
