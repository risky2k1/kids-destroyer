import { TableSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <TableSkeleton columns={6} rows={8} />;
}
