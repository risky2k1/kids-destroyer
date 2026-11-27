import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/core/auth/session';
import { listCatalog } from '@/plugins/kids-learning/catalog';
import { listQuestions } from '@/plugins/kids-learning/question-bank';
import { QuizForm } from './components/QuizForm';
import { type Area } from './lib/area';
import { getQuiz } from './queries';

export async function QuizEditView({ id, area = 'admin' }: { id?: string; area?: Area }) {
  const [catalog, questions, quiz, user] = await Promise.all([
    listCatalog(),
    listQuestions(area === 'parent' ? { scope: 'systemOrMine' } : {}),
    id ? getQuiz(id) : Promise.resolve(null),
    getCurrentUser(),
  ]);
  if (id && !quiz) notFound();
  const readOnly = area === 'parent' && !!quiz && quiz.createdBy !== user?.id;
  return (
    <QuizForm
      area={area}
      readOnly={readOnly}
      quiz={quiz}
      subjects={catalog.subjects}
      grades={catalog.grades}
      questions={questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        typeName: question.typeName,
        subjectId: question.subjectId,
        gradeId: question.gradeId,
      }))}
    />
  );
}
