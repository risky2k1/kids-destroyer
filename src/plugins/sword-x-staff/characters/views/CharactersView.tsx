'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Swords } from 'lucide-react';

import { CharacterList } from '../components/CharacterList';
import { ServerForm } from '../components/ServerForm';
import {
  createBlankCharacter,
  type CharacterSummary,
  type GameServer,
  SXS_PATHS,
  t,
} from '@/plugins/sword-x-staff/studio';
import { PageHeader } from '@/core/ui/PageHeader';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';

export function CharactersView({
  characters,
  servers,
}: {
  characters: CharacterSummary[];
  servers: GameServer[];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [serverId, setServerId] = useState(servers[0]?.id ?? '');
  const [error, setError] = useState('');

  async function create() {
    setError('');
    try {
      const id = await createBlankCharacter(name, serverId);
      router.push(SXS_PATHS.tab(id, 'overview'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi');
    }
  }

  return (
    <>
      <PageHeader icon={Swords} title={t('characters.title')} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
        <ServerForm onCreated={setServerId} onError={setError} />
        <Card>
          <CardHeader>
            <CardTitle>{t('characters.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('characters.name')}
              />
              <NativeSelect
                className="w-48"
                value={serverId}
                onChange={(event) => setServerId(event.target.value)}
              >
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </NativeSelect>
              <Button type="button" onClick={create}>
                {t('characters.create')}
              </Button>
            </div>
            {error ? <p className="text-sm">{error}</p> : null}
            <CharacterList characters={characters} servers={servers} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
