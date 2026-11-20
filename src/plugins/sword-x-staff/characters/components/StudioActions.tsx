'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  exportCharacter,
  importCharacter,
  type Studio,
  SXS_PATHS,
  type StudioTab,
  t,
  SaveNote,
  useSave,
} from '@/plugins/sword-x-staff/studio';
import { Button, buttonVariants } from '@/themes/neobrutal/ui/button';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { cn } from '@/themes/neobrutal/lib/utils';

export function StudioActions({ studio, active }: { studio: Studio; active: StudioTab }) {
  const router = useRouter();
  const { run, status } = useSave();
  const character = studio.character;

  async function onExport() {
    const data = await exportCharacter(character.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <NativeSelect
        className="w-48"
        value={character.id}
        onChange={(event) => router.push(SXS_PATHS.tab(event.target.value, active))}
      >
        {studio.characters.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
      <Link
        href={SXS_PATHS.characters}
        className={cn(buttonVariants({ variant: 'neutral', size: 'sm' }))}
      >
        {t('nav.characters')}
      </Link>
      <Button type="button" variant="neutral" size="sm" onClick={onExport}>
        {t('io.export')}
      </Button>
      <label className={cn(buttonVariants({ variant: 'neutral', size: 'sm' }))}>
        {t('io.import')}
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void run(async () => {
              await importCharacter(character.id, JSON.parse(await file.text()));
            });
          }}
        />
      </label>
      <SaveNote status={status} />
    </>
  );
}
