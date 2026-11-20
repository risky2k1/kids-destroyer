import { FamilyDetailView } from '@/plugins/kids-learning/family';

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FamilyDetailView id={id} />;
}
