'use client';

import { useState } from 'react';

import {
  updateCharacter,
  type Studio,
  patchCharacter,
  SaveNote,
  useSave,
  t,
  studioToLegacy,
  type LegacySkill,
} from '@/plugins/sword-x-staff/studio';
import { buildPrompt } from '../lib/buildPrompt';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Textarea } from '@/themes/neobrutal/ui/textarea';

function catalogOf(studio: Studio): LegacySkill[] {
  return studio.catalog.map((skill) => ({
    id: skill.id,
    tierClass: skill.tier_class,
    type: skill.skill_type,
    vn: skill.vn,
    en: skill.en,
    cn: skill.cn,
    cd: skill.cd,
    element: skill.element,
    tier: skill.tier,
    desc: skill.description,
  }));
}

export function PromptView({ studio }: { studio: Studio }) {
  const { run, status } = useSave();
  const [copied, setCopied] = useState(false);
  const prompt = buildPrompt(studioToLegacy(studio), catalogOf(studio));

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
  }

  return (
    <Card className="bg-secondary-background">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t('prompt.title')}</CardTitle>
        <SaveNote status={status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          rows={4}
          defaultValue={studio.character.custom_question}
          onBlur={(event) => {
            const customQuestion = event.target.value;
            void run(
              () =>
                updateCharacter(studio.character.id, {
                  customQuestion,
                }),
              (current) => patchCharacter(current, { customQuestion }),
            );
          }}
        />
        <div className="flex gap-2">
          <Button type="button" onClick={copy}>
            {copied ? t('prompt.copied') : t('prompt.copy')}
          </Button>
        </div>
        <pre className="overflow-x-auto border-2 border-border bg-background p-3 text-sm whitespace-pre-wrap">
          {prompt}
        </pre>
      </CardContent>
    </Card>
  );
}
