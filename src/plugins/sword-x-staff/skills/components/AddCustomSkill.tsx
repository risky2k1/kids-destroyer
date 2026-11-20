'use client';

import { useState } from 'react';

import { addCustomSkill, t, useSave } from '@/plugins/sword-x-staff/studio';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';

export function AddCustomSkill({ characterId }: { characterId: string }) {
  const { run } = useSave();
  const [vn, setVn] = useState('');
  const [en, setEn] = useState('');
  const [tier, setTier] = useState('R2');
  const [kind, setKind] = useState<'active' | 'passive'>('active');

  return (
    <Card className="bg-secondary-background">
      <CardHeader>
        <CardTitle>{t('skills.add')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Input
          value={vn}
          onChange={(event) => setVn(event.target.value)}
          placeholder="Tên tiếng Việt"
        />
        <Input
          value={en}
          onChange={(event) => setEn(event.target.value)}
          placeholder="Tên tiếng Anh"
        />
        <NativeSelect value={tier} onChange={(event) => setTier(event.target.value)}>
          {['R2', 'R3', 'R4', 'R5+'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={kind}
          onChange={(event) => setKind(event.target.value as 'active' | 'passive')}
        >
          <option value="active">{t('skills.active')}</option>
          <option value="passive">{t('skills.passive')}</option>
        </NativeSelect>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              await addCustomSkill(characterId, {
                vn,
                en,
                tierClass: tier,
                skillType: kind,
              });
              setVn('');
              setEn('');
            })
          }
        >
          {t('skills.add')}
        </Button>
      </CardContent>
    </Card>
  );
}
