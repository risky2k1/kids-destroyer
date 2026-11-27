import { listCatalog } from '@/plugins/kids-learning/catalog';
import { enabledMap } from '@/plugins/kids-learning/question-types/server';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { getCurrentUser } from '@/core/auth/session';
import { DraftRequestForm } from './components/DraftRequestForm';

const AI_TYPES = ['mcq', 'fill', 'number', 'order', 'match'];

export async function AiQuizView() {
  const [catalog, map, user] = await Promise.all([listCatalog(), enabledMap(), getCurrentUser()]);
  const types = AI_TYPES.flatMap((id) => {
    if (map[id] === false) return [];
    const plugin = getPlugin(id);
    return plugin ? [{ id, name: plugin.name }] : [];
  });
  return (
    <DraftRequestForm
      uid={user?.id ?? ''}
      subjects={catalog.subjects}
      grades={catalog.grades}
      topics={catalog.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        subjectId: topic.subject_id,
        gradeId: topic.grade_id,
      }))}
      types={types}
    />
  );
}
