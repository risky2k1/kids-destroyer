import { Skeleton } from '@/themes/neobrutal/ui/skeleton';

export function AdminHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/10 px-3">
      <Skeleton className="size-4 shrink-0" />
      <Skeleton className="h-4 w-32" />
      <div className="ml-auto flex items-center gap-1.5">
        {Array.from({ length: actions }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  columns = 5,
  rows = 7,
  withHeader = true,
}: {
  columns?: number;
  rows?: number;
  withHeader?: boolean;
}) {
  return (
    <>
      {withHeader && <AdminHeaderSkeleton actions={2} />}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/10 px-3">
        <Skeleton className="h-4 w-28" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="bg-secondary-background">
        <div className="flex h-8 items-center gap-3 border-b border-border/10 px-3">
          <Skeleton className="size-3.5" />
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-20" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex h-9 items-center gap-3 border-b border-border/10 px-3">
            <Skeleton className="size-3.5" />
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-3.5 ${c === 0 ? 'w-36' : c === columns - 1 ? 'w-16' : 'w-24'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function FormSkeleton({
  fields = 5,
  withHeader = true,
  withSection = false,
}: {
  fields?: number;
  withHeader?: boolean;
  withSection?: boolean;
}) {
  return (
    <>
      {withHeader && <AdminHeaderSkeleton actions={1} />}
      <div className="flex max-w-2xl flex-col gap-5 p-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className={i === fields - 1 ? 'h-24 w-full' : 'h-10 w-full'} />
          </div>
        ))}
        <Skeleton className="h-10 w-28" />
        {withSection && (
          <div className="mt-2 flex flex-col gap-3 border-t-2 border-border/10 pt-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
      </div>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <AdminHeaderSkeleton actions={0} />
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-base border border-border/10 bg-secondary-background p-3"
            >
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, card) => (
            <div
              key={card}
              className="flex flex-col gap-3 rounded-base border border-border/10 bg-secondary-background p-3"
            >
              <Skeleton className="h-4 w-36" />
              {Array.from({ length: 4 }).map((_, row) => (
                <Skeleton key={row} className="h-6 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function CardGridSkeleton({ count = 4, cols = 2 }: { count?: number; cols?: 2 | 3 }) {
  return (
    <>
      <AdminHeaderSkeleton actions={1} />
      <div className={`grid gap-4 p-4 ${cols === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-base border-2 border-border/15 bg-secondary-background p-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    </>
  );
}

export function AssignmentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <AdminHeaderSkeleton actions={0} />
      <div className="flex flex-col gap-4 rounded-base border-2 border-border/15 bg-secondary-background p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <TableSkeleton columns={5} rows={5} withHeader={false} />
    </div>
  );
}

export function PlacesPickerSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 bg-background px-4 py-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-3 gap-1.5">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-24" />
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-base border-2 border-border/20 bg-secondary-background p-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
    </main>
  );
}

export function ParentHomeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-11 w-44" />
      <div className="flex flex-col gap-4 rounded-base border-2 border-border/15 bg-secondary-background p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      <TableSkeleton columns={5} rows={4} withHeader={false} />
    </div>
  );
}

export function KidPickerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-base border-2 border-border/15 bg-secondary-background p-6"
          >
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KidHomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-44" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-base border-2 border-border/15 bg-secondary-background p-4"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-28" />
        </div>
      ))}
    </div>
  );
}

export function KidPlaySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex flex-col gap-4 rounded-base border-2 border-border/15 bg-secondary-background p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
