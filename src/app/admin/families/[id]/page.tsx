import { FamilyDetailView } from '@/packages/family';

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FamilyDetailView id={id} />;
}
