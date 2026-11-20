import { CharactersView } from '@/plugins/sword-x-staff/characters';
import { ensureStarter } from '@/plugins/sword-x-staff/studio';
import { listCharacters, listServers } from '@/plugins/sword-x-staff/studio/server';

export default async function Page() {
  await ensureStarter();
  const [characters, servers] = await Promise.all([listCharacters(), listServers()]);
  return <CharactersView characters={characters} servers={servers} />;
}
