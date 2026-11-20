'use client';

import {
  updateCharacter,
  assignServer,
  updateServerOpenedOn,
  type Studio,
  CLASS_OPTIONS,
  SPENDING_OPTIONS,
  serverDay,
  t,
  Field,
  GameIcon,
  patchCharacter,
  patchServer,
  patchServerOpenedOn,
  SaveNote,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';

export function OverviewView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const character = studio.character;
  const selectedServer =
    studio.servers.find((server) => server.id === character.server_id) ?? character.servers;

  const save = (patch: Record<string, string | number>) =>
    run(
      () => updateCharacter(character.id, patch),
      (current) => patchCharacter(current, patch),
    );

  return (
    <Card className="bg-secondary-background">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <GameIcon iconKey="duelist_hero" alt="" />
          <CardTitle>{t('overview.title')}</CardTitle>
        </div>
        <SaveNote status={status} />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label={t('overview.server')}>
          <NativeSelect
            value={character.server_id}
            onChange={(event) => {
              const serverId = event.target.value;
              void run(
                () => assignServer(character.id, serverId),
                (current) => patchServer(current, serverId),
              );
            }}
          >
            {studio.servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('overview.serverOpenedOn')}>
          <Input
            type="date"
            value={selectedServer?.opened_on ?? ''}
            onChange={(event) => {
              const openedOn = event.target.value;
              if (!selectedServer || !openedOn) return;
              void run(
                () => updateServerOpenedOn(selectedServer.id, openedOn),
                (current) => patchServerOpenedOn(current, selectedServer.id, openedOn),
              );
            }}
          />
        </Field>
        <Field label={t('overview.serverDay')}>
          <Input readOnly value={selectedServer ? serverDay(selectedServer.opened_on) : ''} />
        </Field>
        <Field label={t('overview.playerName')}>
          <Input
            defaultValue={character.name}
            onBlur={(event) => save({ name: event.target.value })}
          />
        </Field>
        <Field label={t('overview.combatPower')}>
          <Input
            defaultValue={character.combat_power}
            onBlur={(event) => save({ combatPower: event.target.value })}
          />
        </Field>
        <Field label={t('overview.level')}>
          <Input
            type="number"
            min={1}
            defaultValue={character.level}
            onBlur={(event) => save({ level: Math.max(1, Number(event.target.value)) })}
          />
        </Field>
        <Field label={t('overview.currentClass')}>
          <NativeSelect
            defaultValue={character.current_class}
            onChange={(event) => save({ currentClass: event.target.value })}
          >
            {CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('overview.spendingTier')}>
          <NativeSelect
            defaultValue={character.spending_tier}
            onChange={(event) => save({ spendingTier: event.target.value })}
          >
            {SPENDING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <div className="sm:col-span-2">
          <Field label={t('overview.gearSummary')}>
            <Input
              maxLength={200}
              placeholder="e.g. Set Huyền thoại +12, vũ khí Thần thoại"
              defaultValue={character.gear_summary}
              onBlur={(event) => save({ gearSummary: event.target.value })}
            />
          </Field>
        </div>
        <div className="mt-2 sm:col-span-2">
          <h3 className="font-heading text-lg">{t('overview.resources')}</h3>
        </div>
        <Field label={t('overview.dawnium')}>
          {/* Text, not number: the game shows amounts like "8.51K". */}
          <Input
            defaultValue={character.morning_star}
            onBlur={(event) => save({ morningStar: event.target.value })}
          />
        </Field>
        <Field label={t('overview.stellatie')}>
          <Input
            type="number"
            min={0}
            defaultValue={character.normal_prayer_tickets}
            onBlur={(event) =>
              save({ normalPrayerTickets: Math.max(0, parseInt(event.target.value, 10) || 0) })
            }
          />
        </Field>
        <Field label={t('overview.covenite')}>
          <Input
            type="number"
            min={0}
            defaultValue={character.class_prayer_tickets}
            onBlur={(event) =>
              save({ classPrayerTickets: Math.max(0, parseInt(event.target.value, 10) || 0) })
            }
          />
        </Field>
        <Field label={t('overview.skillSelectTickets')}>
          <Input
            type="number"
            min={0}
            defaultValue={character.skill_select_tickets}
            onBlur={(event) =>
              save({ skillSelectTickets: Math.max(0, parseInt(event.target.value, 10) || 0) })
            }
          />
        </Field>
        <Field label={t('overview.fateFruits')}>
          <Input
            type="number"
            min={0}
            defaultValue={character.fate_fruits}
            onBlur={(event) =>
              save({ fateFruits: Math.max(0, parseInt(event.target.value, 10) || 0) })
            }
          />
        </Field>
        <Field label={t('overview.timeCrystals')}>
          <Input
            type="number"
            min={0}
            defaultValue={character.time_crystals}
            onBlur={(event) =>
              save({ timeCrystals: Math.max(0, parseInt(event.target.value, 10) || 0) })
            }
          />
        </Field>
      </CardContent>
    </Card>
  );
}
