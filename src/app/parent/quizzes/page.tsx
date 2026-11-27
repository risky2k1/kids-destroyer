import { QuizzesView } from '@/plugins/kids-learning/quiz';

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string | string[] }>;
}) {
  const params = await searchParams;
  const origin = first(params.origin) === 'parent' ? 'parent' : 'system';
  return <QuizzesView area="parent" origin={origin} />;
}
