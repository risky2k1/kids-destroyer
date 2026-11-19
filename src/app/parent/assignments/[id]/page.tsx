import { AssignmentResultView } from '@/packages/assignment';

export default async function ParentAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssignmentResultView id={id} basePath="parent" />;
}
