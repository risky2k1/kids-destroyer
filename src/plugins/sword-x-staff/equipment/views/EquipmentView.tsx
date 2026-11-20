'use client';

import {
  setAllSkillSlots,
  updateEquipment,
  updateSkillSlot,
  type Studio,
  resonance,
  patchAllSkillSlots,
  patchEquipment,
  patchSkillSlot,
  t,
  Field,
  GameIcon,
  QualityRadios,
  SaveNote,
  useSave,
  type SaveFn,
} from '@/plugins/sword-x-staff/studio';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';

export function EquipmentView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const gear = resonance(studio.equipment.map((item) => item.level));

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-secondary-background">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('equipment.title')}</CardTitle>
          <SaveNote status={status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="border-2 border-border bg-main p-3 text-sm">
            Resonance +{gear.current}. Next +{gear.next}. {gear.advice}
          </p>
          {studio.equipment.map((item) => (
            <div
              key={item.slot_key}
              className="grid gap-2 border-2 border-border p-3 sm:grid-cols-4"
            >
              <div className="flex items-center gap-2 font-heading">
                <GameIcon iconKey={item.icon_key} alt={item.name} />
                {item.name}
              </div>
              <Field label={t('equipment.level')}>
                <Input
                  type="number"
                  defaultValue={item.level}
                  onBlur={(event) => {
                    const level = Number(event.target.value);
                    void run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          level,
                        }),
                      (current) => patchEquipment(current, item.slot_key, { level }),
                    );
                  }}
                />
              </Field>
              <div className="sm:col-span-2">
                <QualityRadios
                  name={`eq-${item.slot_key}`}
                  value={item.quality}
                  onChange={(quality) =>
                    run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          quality,
                        }),
                      (current) => patchEquipment(current, item.slot_key, { quality }),
                    )
                  }
                />
              </div>
              <Field label={t('equipment.notes')}>
                <Input
                  defaultValue={item.notes}
                  onBlur={(event) => {
                    const notes = event.target.value;
                    void run(
                      () =>
                        updateEquipment(studio.character.id, item.slot_key, {
                          notes,
                        }),
                      (current) => patchEquipment(current, item.slot_key, { notes }),
                    );
                  }}
                />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>
      <EssenceSlots studio={studio} run={run} />
    </div>
  );
}

function slotLabel(index: number) {
  const charm = index > 4;
  return `${charm ? 'Charm' : 'Technique'} #${charm ? index - 4 : index}`;
}

function EssenceSlots({ studio, run }: { studio: Studio; run: SaveFn }) {
  return (
    <Card className="bg-secondary-background">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t('equipment.slots')}</CardTitle>
        <Button
          type="button"
          variant="neutral"
          onClick={() => {
            const value = Number(window.prompt('Cấp cho cả 8 ô', '36'));
            if (value)
              void run(
                () => setAllSkillSlots(studio.character.id, value),
                (current) => patchAllSkillSlots(current, value),
              );
          }}
        >
          {t('equipment.applyAll')}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-4">
        {studio.skillSlots.map((slot) => (
          <Field key={slot.slot_index} label={slotLabel(slot.slot_index)}>
            <Input
              type="number"
              defaultValue={slot.level}
              onBlur={(event) => {
                const level = Number(event.target.value);
                void run(
                  () => updateSkillSlot(studio.character.id, slot.slot_index, level),
                  (current) => patchSkillSlot(current, slot.slot_index, level),
                );
              }}
            />
          </Field>
        ))}
      </CardContent>
    </Card>
  );
}
