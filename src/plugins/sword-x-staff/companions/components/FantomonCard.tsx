'use client';

import type { FantomonCard, Studio } from '@/plugins/sword-x-staff/studio';
import { GameIcon, QualityRadios, StarRow } from '@/plugins/sword-x-staff/studio';
import { cn } from '@/themes/neobrutal/lib/utils';

export function FantomonCardView({
  pet,
  onSave,
}: {
  pet: FantomonCard;
  studio: Studio;
  onSave: (
    pet: FantomonCard,
    patch: {
      owned?: boolean;
      quality?: string;
      stars?: number;
    },
  ) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({ id: pet.id, kind: 'fantomon' }),
        );
      }}
      className={cn('flex flex-col gap-2 border-2 border-border p-3', !pet.owned && 'opacity-40')}
    >
      <div className="flex items-start gap-2">
        <GameIcon iconKey={pet.iconKey} alt={pet.name} />
        <div>
          <p className="font-heading">{pet.name}</p>
          <p className="text-sm">{pet.role}</p>
        </div>
        <label className="ml-auto flex flex-col items-center text-base font-heading">
          <input
            type="checkbox"
            className="size-6"
            checked={pet.owned}
            onChange={(event) => onSave(pet, { owned: event.target.checked })}
          />
          Owned
        </label>
      </div>
      <QualityRadios
        name={`fantomon-${pet.id}`}
        value={pet.quality}
        onChange={(quality) => onSave(pet, { quality })}
      />
      <StarRow value={pet.stars} onChange={(stars) => onSave(pet, { stars })} />
    </article>
  );
}
