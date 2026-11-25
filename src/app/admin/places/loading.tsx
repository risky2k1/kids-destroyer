import { TableSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <TableSkeleton columns={7} rows={6} />;
}
