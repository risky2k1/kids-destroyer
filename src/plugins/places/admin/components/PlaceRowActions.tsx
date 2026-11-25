'use client';

import { LogVisitDialog } from './LogVisitDialog';

export function PlaceRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <LogVisitDialog placeId={id} placeName={name} />
    </div>
  );
}
