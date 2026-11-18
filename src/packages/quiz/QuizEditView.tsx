import { notFound } from 'next/navigation';
import { listCatalog } from '@/packages/catalog';
import { listQuestions } from '@/packages/question-bank';
import { QuizForm } from './components/QuizForm';
import { getQuiz } from './queries';

export async function QuizEditView({ id }: { id?: string }) {
  const [catalog, questions, quiz] = await Promise.all([
    listCatalog(),
    listQuestions({}),
    id ? getQuiz(id) : Promise.resolve(null),
  ]);
  if (id && !quiz) notFound();
  return (
    <QuizForm
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
