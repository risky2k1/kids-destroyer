'use client';

import {
  updateCompanion,
  updateCharacter,
  type CharacterRow,
  type Studio,
  t,
  Field,
  GameIcon,
  patchCharacter,
  patchCompanion,
  SaveNote,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { FantomonBoard } from '../components/FantomonBoard';
import { UnopenedCompanions } from '../components/UnopenedCompanions';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';

const HOME: {
  key: string;
  label: string;
  value: (c: CharacterRow) => number;
}[] = [
  { key: 'cartStoneLv', label: 'Stone', value: (c) => c.cart_stone_lv },
  { key: 'cartOreLv', label: 'Raw Ore', value: (c) => c.cart_ore_lv },
  { key: 'cartWoodLv', label: 'Wood', value: (c) => c.cart_wood_lv },
  { key: 'cartSandLv', label: 'Chrono Sand', value: (c) => c.cart_sand_lv },
  { key: 'cartOtherLv', label: 'Other', value: (c) => c.cart_other_lv },
  { key: 'bedLv', label: 'Bed', value: (c) => c.bed_lv },
];

export function CompanionsView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const character = studio.character;
  const save = (patch: Record<string, string | number>) =>
    run(
      () => updateCharacter(character.id, patch),
      (current) => patchCharacter(current, patch),
    );

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-secondary-background">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('companions.title')}</CardTitle>
          <SaveNote status={status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {studio.companions
            .filter((companion) => companion.opened)
            .map((companion) => (
              <div
                key={companion.companion_id}
                className="flex flex-wrap items-center gap-3 border-2 border-border p-3"
              >
                <GameIcon iconKey={companion.icon_key || 'player_avatar'} alt={companion.name} />
                <div className="mr-auto">
                  <p className="font-heading">{companion.name}</p>
                  <p className="text-sm">Gift: {companion.gift_type}</p>
                  <p className="text-sm">{companion.stats}</p>
                  <p className="text-sm">{companion.priority}</p>
                </div>
                <Field label={t('companions.level')}>
                  <Input
                    type="number"
                    defaultValue={companion.level}
                    onBlur={(event) => {
                      const level = Number(event.target.value);
                      void run(
                        () => updateCompanion(character.id, companion.companion_id, level),
                        (current) => patchCompanion(current, companion.companion_id, level),
                      );
                    }}
                  />
                </Field>
              </div>
            ))}
          <UnopenedCompanions studio={studio} />
        </CardContent>
      </Card>
      <PetAndHome studio={studio} save={save} />
    </div>
  );
}

function PetAndHome({
  studio,
  save,
}: {
  studio: Studio;
  save: (patch: Record<string, string | number>) => void;
}) {
  const character = studio.character;
  return (
    <>
      <FantomonBoard studio={studio} />
      <Card className="bg-secondary-background">
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Field label="Fantomon status">
            <Input
              defaultValue={character.pet_status}
              onBlur={(event) => save({ petStatus: event.target.value })}
            />
          </Field>
          <Field label="Relics">
            <Input
              defaultValue={character.relic_progress}
              onBlur={(event) => save({ relicProgress: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
      <Card className="bg-secondary-background">
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {HOME.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input
                type="number"
                defaultValue={field.value(character)}
                onBlur={(event) => save({ [field.key]: Number(event.target.value) })}
              />
            </Field>
          ))}
          <Field label="Goddess Statue">
            <Input
              defaultValue={character.goddess_statues}
              onBlur={(event) => save({ goddessStatues: event.target.value })}
            />
          </Field>
          <Field label="Vendor Booth">
            <Input
              defaultValue={character.shop_routine}
              onBlur={(event) => save({ shopRoutine: event.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
    </>
  );
}
