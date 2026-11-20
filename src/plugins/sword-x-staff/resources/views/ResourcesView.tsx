'use client';

import {
  updateCharacter,
  type CharacterRow,
  type Studio,
  t,
  Field,
  GameIcon,
  patchCharacter,
  SaveNote,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';

const TEXT_FIELDS: {
  key: string;
  label: string;
  icon: string;
  value: (c: CharacterRow) => string;
}[] = [
  {
    key: 'morningStar',
    label: 'Dawnium',
    icon: 'item_morning_star',
    value: (c) => c.morning_star,
  },
  {
    key: 'coloredDiamond',
    label: 'Luminium',
    icon: 'item_colored_diamond',
    value: (c) => c.colored_diamond,
  },
  { key: 'gold', label: 'Rolla', icon: 'item_gold', value: (c) => c.gold },
  {
    key: 'stamina',
    label: 'Stamina',
    icon: 'item_battle_essence',
    value: (c) => c.stamina,
  },
  {
    key: 'battleEssence',
    label: 'Battle Essence',
    icon: 'item_battle_essence',
    value: (c) => c.battle_essence,
  },
  {
    key: 'dailyBuyPattern',
    label: 'Material Realm routine',
    icon: 'item_enhance_stone',
    value: (c) => c.daily_buy_pattern,
  },
];

const NUMBER_FIELDS: {
  key: string;
  label: string;
  value: (c: CharacterRow) => number;
}[] = [
  {
    key: 'normalPrayerTickets',
    label: 'Stellatie',
    value: (c) => c.normal_prayer_tickets,
  },
  {
    key: 'classPrayerTickets',
    label: 'Covenite',
    value: (c) => c.class_prayer_tickets,
  },
  {
    key: 'skillSelectTickets',
    label: 'Skill Shard Voucher',
    value: (c) => c.skill_select_tickets,
  },
  {
    key: 'secretRealmTotal',
    label: 'Material Realm runs',
    value: (c) => c.secret_realm_total,
  },
  { key: 'hammerStone', label: 'Iron Hammer', value: (c) => c.hammer_stone },
  { key: 'pickaxeGold', label: 'Gold Pickaxe', value: (c) => c.pickaxe_gold },
  {
    key: 'gloveEssence',
    label: 'Worn Knuckles',
    value: (c) => c.glove_essence,
  },
  { key: 'shovelSand', label: 'Sand Shovel', value: (c) => c.shovel_sand },
  { key: 'fateFruits', label: 'Destiny Fruit', value: (c) => c.fate_fruits },
  {
    key: 'timeCrystals',
    label: 'Temporal Crystal',
    value: (c) => c.time_crystals,
  },
];

export function ResourcesView({ studio }: { studio: Studio }) {
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
        <CardTitle>{t('resources.title')}</CardTitle>
        <SaveNote status={status} />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <Field key={field.key} label={field.label}>
            <span className="flex items-center gap-2">
              <GameIcon iconKey={field.icon} alt="" className="size-8" />
              <Input
                defaultValue={field.value(character)}
                onBlur={(event) => save({ [field.key]: event.target.value })}
              />
            </span>
          </Field>
        ))}
        {NUMBER_FIELDS.map((field) => (
          <Field key={field.key} label={field.label}>
            <Input
              type="number"
              defaultValue={field.value(character)}
              onBlur={(event) => save({ [field.key]: Number(event.target.value) })}
            />
          </Field>
        ))}
      </CardContent>
    </Card>
  );
}
