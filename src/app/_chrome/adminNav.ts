import { PATHS } from '@/core/routes';

export type NavKey = 'home' | 'subjects' | 'grades' | 'topics' | 'families';

const SECTIONS: { key: Exclude<NavKey, 'home'>; href: string }[] = [
  { key: 'subjects', href: PATHS.admin.subjects },
  { key: 'grades', href: PATHS.admin.grades },
  { key: 'topics', href: PATHS.admin.topics },
  { key: 'families', href: PATHS.admin.families },
];

/** Exact match for `/admin`; prefix match for the other admin screens. */
export function activeNav(pathname: string): NavKey | null {
  if (pathname === PATHS.admin.root) return 'home';
  for (const section of SECTIONS) {
    if (pathname === section.href || pathname.startsWith(`${section.href}/`)) return section.key;
  }
  return null;
}
