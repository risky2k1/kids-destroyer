'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords } from 'lucide-react';

import { CompanionsView } from '@/plugins/sword-x-staff/companions';
import { OverviewView } from '@/plugins/sword-x-staff/overview';
import { PromptView } from '@/plugins/sword-x-staff/prompt';
import { SkillsView } from '@/plugins/sword-x-staff/skills';
import { StudioActions } from './StudioActions';
import {
  type Studio,
  StudioDraftProvider,
  useDraftStudio,
  SXS_PATHS,
  tabFromPath,
  type StudioTab,
  serverDay,
  t,
} from '@/plugins/sword-x-staff/studio';
import { PageHeader } from '@/core/ui/PageHeader';
import { buttonVariants } from '@/themes/neobrutal/ui/button';
import { cn } from '@/themes/neobrutal/lib/utils';

const NAV: { tab: StudioTab; label: string }[] = [
  { tab: 'overview', label: 'nav.overview' },
  { tab: 'skills', label: 'nav.skills' },
  { tab: 'companions', label: 'nav.companions' },
  { tab: 'prompt', label: 'nav.prompt' },
];

const VIEWS = {
  overview: OverviewView,
  skills: SkillsView,
  companions: CompanionsView,
  prompt: PromptView,
};

function plainClick(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  button: number;
}) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function StudioShell({ studio, children }: { studio: Studio; children: ReactNode }) {
  return (
    <StudioDraftProvider studio={studio}>
      <StudioFrame>{children}</StudioFrame>
    </StudioDraftProvider>
  );
}

function StudioFrame({ children }: { children: ReactNode }) {
  const studio = useDraftStudio();
  const routeTab = tabFromPath(usePathname());
  const [picked, setPicked] = useState<StudioTab | null>(null);
  const active = picked ?? routeTab;
  const character = studio.character;
  const activeServer =
    studio.servers.find((s) => s.id === character.server_id) ?? character.servers;
  const owned =
    studio.skills.filter((skill) => skill.owned).length +
    studio.customSkills.filter((skill) => skill.owned).length;
  const View = VIEWS[active];

  useEffect(() => {
    const onPop = () => setPicked(tabFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div>
      <PageHeader
        icon={Swords}
        title={character.name || t('app.title')}
        crumbs={[{ href: SXS_PATHS.characters, label: t('nav.characters') }]}
        actions={<StudioActions studio={studio} active={active} />}
      />
      <div className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-2 text-sm font-heading">
            <span className="border-2 border-border bg-background px-2 py-1">
              {activeServer?.name ?? 'Server'} · Day{' '}
              {activeServer ? serverDay(activeServer.opened_on) : 1} · Lv.
              {character.level}
            </span>
            <span className="border-2 border-border bg-main px-2 py-1">
              {character.combat_power}
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">
              {character.current_class}
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">
              {character.morning_star} Dawnium
            </span>
            <span className="border-2 border-border bg-background px-2 py-1">{owned} kỹ năng</span>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.tab}
                href={SXS_PATHS.tab(character.id, item.tab)}
                onClick={(event) => {
                  if (plainClick(event)) setPicked(item.tab);
                }}
                className={cn(
                  buttonVariants({
                    variant: item.tab === active ? 'default' : 'neutral',
                    size: 'sm',
                  }),
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
        <View studio={studio} />
        {children}
      </main>
    </div>
  );
}
