import { CardGridSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <CardGridSkeleton count={3} cols={3} />;
}
