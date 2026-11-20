'use client';

import { useState } from 'react';

import {
  addCompanion,
  type Studio,
  patchAddCompanion,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';

export function UnopenedCompanions({ studio }: { studio: Studio }) {
  const { run } = useSave();
  const [query, setQuery] = useState('');
  const closed = studio.companions.filter((companion) => !companion.opened);
  const needle = query.trim().toLowerCase();
  const shown = closed.filter((companion) =>
    `${companion.name} ${companion.stats} ${companion.gift_type}`.toLowerCase().includes(needle),
  );
  if (closed.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-2 border-dashed border-border p-3">
      <p className="font-heading">Chưa mở</p>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Carol, Braulio"
        className="max-w-xs"
      />
      <div className="flex flex-wrap gap-2">
        {shown.map((companion) => (
          <Button
            key={companion.companion_id}
            type="button"
            size="sm"
            variant="neutral"
            onClick={() =>
              run(
                () => addCompanion(studio.character.id, companion.companion_id),
                (current) => patchAddCompanion(current, companion.companion_id),
              )
            }
          >
            {companion.name} · {companion.gift_type}
          </Button>
        ))}
      </div>
    </div>
  );
}
