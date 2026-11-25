import { Puzzle } from 'lucide-react';
import { enabledMap } from '@/plugins/kids-learning/question-types/server';
import { PageHeader } from '@/core/ui/PageHeader';
import { getPlugin, PLUGIN_IDS } from '@/plugins/kids-learning/question-types';
import { PluginsTable } from './components/PluginsTable';
import { countQuestionsByType } from './queries';

export async function PluginsView() {
  const [map, counts] = await Promise.all([enabledMap(), countQuestionsByType()]);
  const rows = PLUGIN_IDS.flatMap((id) => {
    const plugin = getPlugin(id);
    if (!plugin) return [];
    return [
      {
        id,
        name: plugin.name,
        description: plugin.description,
        count: counts[id] ?? 0,
        enabled: map[id] !== false,
      },
    ];
  });
  return (
    <>
      <PageHeader icon={Puzzle} title="Dạng câu" />
      <PluginsTable rows={rows} />
    </>
  );
}
