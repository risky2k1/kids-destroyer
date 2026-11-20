'use client';

import {
  updateCharacter,
  assignServer,
  type CharacterRow,
  type Studio,
  CLASS_OPTIONS,
  SPENDING_OPTIONS,
  serverDay,
  t,
  Field,
  GameIcon,
  patchCharacter,
  patchServer,
  SaveNote,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';

const TEXT_FIELDS: {
  key: string;
  label: string;
  value: (c: CharacterRow) => string;
}[] = [
  { key: 'name', label: 'overview.playerName', value: (c) => c.name },
  {
    key: 'combatPower',
    label: 'overview.combatPower',
    value: (c) => c.combat_power,
  },
  { key: 'rankTier', label: 'overview.rankTier', value: (c) => c.rank_tier },
  {
    key: 'currentMap',
    label: 'overview.currentMap',
    value: (c) => c.current_map,
  },
  {
    key: 'mirageTower',
    label: 'overview.mirageTower',
    value: (c) => c.mirage_tower,
  },
  {
    key: 'dailyDungeonStatus',
    label: 'overview.dailyDungeonStatus',
    value: (c) => c.daily_dungeon_status,
  },
];

const NUMBER_FIELDS: {
  key: string;
  label: string;
  value: (c: CharacterRow) => number;
}[] = [
  { key: 'level', label: 'overview.level', value: (c) => c.level },
  {
    key: 'totalJobLevel',
    label: 'overview.totalJobLevel',
    value: (c) => c.total_job_level,
  },
  {
    key: 'warriorJobLevel',
    label: 'overview.warriorJobLevel',
    value: (c) => c.warrior_job_level,
  },
  {
    key: 'duelistJobLevel',
    label: 'overview.duelistJobLevel',
    value: (c) => c.duelist_job_level,
  },
  {
    key: 'mageJobLevel',
    label: 'overview.mageJobLevel',
    value: (c) => c.mage_job_level,
  },
];

export function OverviewView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const character = studio.character;
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
        <Field label="Server">
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
        <Field label="Day">
          <Input readOnly value={character.servers ? serverDay(character.servers.opened_on) : ''} />
        </Field>
        {TEXT_FIELDS.map((field) => (
          <Field key={field.key} label={t(field.label)}>
            <Input
              defaultValue={field.value(character)}
              onBlur={(event) => save({ [field.key]: event.target.value })}
            />
          </Field>
        ))}
        {NUMBER_FIELDS.map((field) => (
          <Field key={field.key} label={t(field.label)}>
            <Input
              type="number"
              defaultValue={field.value(character)}
              onBlur={(event) => save({ [field.key]: Number(event.target.value) })}
            />
          </Field>
        ))}
        <Field label={t('overview.currentClass')}>
          <NativeSelect
            defaultValue={character.current_class}
            onChange={(event) => save({ currentClass: event.target.value })}
          >
            {CLASS_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t('overview.spendingTier')}>
          <NativeSelect
            defaultValue={character.spending_tier}
            onChange={(event) => save({ spendingTier: event.target.value })}
          >
            {SPENDING_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </NativeSelect>
        </Field>
      </CardContent>
    </Card>
  );
}
