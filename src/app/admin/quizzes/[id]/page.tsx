import { QuizEditView } from '@/plugins/kids-learning/quiz/server';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizEditView id={id} />;
}
