import { TableSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <TableSkeleton columns={4} rows={6} />;
}
