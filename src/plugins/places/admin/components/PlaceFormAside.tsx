'use client';

import { PLACE_STATUSES, STATUS_LABELS, type PlaceStatus } from '@/plugins/places/shared';
import { Button } from '@/themes/neobrutal/ui/button';
import { Label } from '@/themes/neobrutal/ui/label';

export function PlaceFormAside({
  pending,
  status,
  onStatus,
}: {
  pending: boolean;
  status: PlaceStatus;
  onStatus: (status: PlaceStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-3">
      <div className="flex flex-col gap-2">
        <Button type="submit" name="intent" value="edit" disabled={pending} className="w-full">
          Lưu
        </Button>
        <Button
          type="submit"
          name="intent"
          value="index"
          variant="neutral"
          disabled={pending}
          className="w-full"
        >
          Lưu và thoát
        </Button>
        <Button
          type="submit"
          name="intent"
          value="new"
          variant="neutral"
          disabled={pending}
          className="w-full"
        >
          Lưu và tạo mới
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Trạng thái</Label>
        <div className="flex flex-wrap gap-2">
          {PLACE_STATUSES.map((s) => (
            <label
              key={s}
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 text-sm has-checked:bg-main has-checked:font-heading has-checked:text-main-foreground"
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => onStatus(s)}
                className="sr-only"
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
