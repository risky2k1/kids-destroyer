'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { OPENING_PRESETS, parseTimeMinutes, type OpeningSlot } from '@/plugins/places/shared';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { TimePicker } from '@/themes/neobrutal/ui/time-picker';

const MAX_SLOTS = 5;

export function OpeningHoursInput({ defaultValue }: { defaultValue: OpeningSlot[] }) {
  const [slots, setSlots] = useState<OpeningSlot[]>(defaultValue);

  const update = (index: number, key: 'open' | 'close', val: string) =>
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: val } : s)));

  const remove = (index: number) => setSlots((prev) => prev.filter((_, i) => i !== index));

  const add = () => {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, { open: '08:00', close: '22:00' }]);
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="openHours" value={JSON.stringify(slots)} />
      <div className="flex flex-wrap gap-1.5">
        {OPENING_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            size="xs"
            variant="neutral"
            onClick={() => setSlots(preset.slots)}
          >
            {preset.label}
          </Button>
        ))}
        {slots.length > 0 && (
          <Button type="button" size="xs" variant="neutral" onClick={() => setSlots([])}>
            Xóa hết
          </Button>
        )}
      </div>

      {slots.length === 0 ? (
        <p className="text-xs text-foreground/60">
          Chưa nhập giờ mở cửa (mặc định vẫn gợi ý ở mọi khung giờ).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {slots.map((slot, i) => {
            const openMin = parseTimeMinutes(slot.open);
            const closeMin = parseTimeMinutes(slot.close);
            const overnight = openMin !== null && closeMin !== null && closeMin < openMin;
            const allDay = openMin !== null && closeMin !== null && openMin === closeMin;
            return (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <TimePicker
                  aria-label={`Giờ mở ca ${i + 1}`}
                  value={slot.open}
                  onChange={(v) => update(i, 'open', v)}
                />
                <span className="text-sm text-foreground/60">đến</span>
                <TimePicker
                  aria-label={`Giờ đóng ca ${i + 1}`}
                  value={slot.close}
                  onChange={(v) => update(i, 'close', v)}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="neutral"
                  aria-label={`Xóa ca ${i + 1}`}
                  onClick={() => remove(i)}
                >
                  <X />
                </Button>
                {overnight && <Badge variant="neutral">Qua đêm</Badge>}
                {allDay && <Badge variant="neutral">Mở 24/24</Badge>}
              </li>
            );
          })}
        </ul>
      )}

      {slots.length < MAX_SLOTS && (
        <Button type="button" size="sm" variant="neutral" onClick={add} className="w-fit gap-1">
          <Plus className="size-3.5" /> Thêm ca mở cửa
        </Button>
      )}
    </div>
  );
}
