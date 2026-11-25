import { CardGridSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <CardGridSkeleton count={6} cols={3} />;
}
