import { KidAssignmentView } from '@/packages/assignment';

export default async function KidAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KidAssignmentView id={id} />;
}
