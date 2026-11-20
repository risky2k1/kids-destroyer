import { QuestionEditView } from '@/plugins/kids-learning/question-bank';

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestionEditView id={id} />;
}
