import { TableSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <TableSkeleton columns={5} rows={6} />;
}
