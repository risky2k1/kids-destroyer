import { FormSkeleton } from '@/core/ui/PageSkeletons';

export default function Loading() {
  return <FormSkeleton fields={5} withHeader={false} />;
}
