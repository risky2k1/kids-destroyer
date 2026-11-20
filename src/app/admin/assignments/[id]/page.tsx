import { AssignmentResultView } from '@/plugins/kids-learning/assignment';

export default async function AdminAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssignmentResultView id={id} basePath="admin" />;
}
