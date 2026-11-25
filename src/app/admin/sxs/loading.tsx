import { CardGridSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <CardGridSkeleton count={4} cols={2} />;
}
