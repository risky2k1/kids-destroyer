import { notFound } from 'next/navigation';
import { listCatalog } from '@/plugins/kids-learning/catalog';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { QuestionForm } from './components/QuestionForm';
import { getQuestion, listEnabledTypes } from './queries';

export async function QuestionEditView({
  id,
  area = 'admin',
}: {
  id?: string;
  area?: 'admin' | 'parent';
}) {
  const [catalog, enabled, question] = await Promise.all([
    listCatalog(),
    listEnabledTypes(),
    id ? getQuestion(id) : Promise.resolve(null),
  ]);
  if (id && !question) notFound();
  const types =
    question && !enabled.some((item) => item.id === question.type)
      ? [{ id: question.type, name: getPlugin(question.type)?.name ?? question.type }, ...enabled]
      : enabled;
  return (
    <QuestionForm
      area={area}
      question={question}
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
