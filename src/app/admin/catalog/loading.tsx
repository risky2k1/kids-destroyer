import { TableSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <TableSkeleton columns={3} rows={6} />;
}
