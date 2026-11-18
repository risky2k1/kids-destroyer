import { QuestionsView } from '@/packages/question-bank';

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string | string[];
    grade?: string | string[];
    type?: string | string[];
  }>;
}) {
  const params = await searchParams;
  return (
    <QuestionsView
      subject={first(params.subject)}
      grade={first(params.grade)}
      type={first(params.type)}
    />
  );
}
