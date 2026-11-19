import { PATHS } from '@/core/routes';

export type NavKey =
  | 'home'
  | 'subjects'
  | 'grades'
  | 'topics'
  | 'families'
  | 'questions'
  | 'quizzes'
  | 'assignments'
  | 'plugins';

const SECTIONS: { key: Exclude<NavKey, 'home'>; href: string }[] = [
  { key: 'subjects', href: PATHS.admin.subjects },
  { key: 'grades', href: PATHS.admin.grades },
  { key: 'topics', href: PATHS.admin.topics },
  { key: 'families', href: PATHS.admin.families },
  { key: 'questions', href: PATHS.admin.questions },
  { key: 'quizzes', href: PATHS.admin.quizzes },
  { key: 'assignments', href: PATHS.admin.assignments },
  { key: 'plugins', href: PATHS.admin.plugins },
];

/** Exact match for `/admin`; prefix match for the other admin screens. */
export function activeNav(pathname: string): NavKey | null {
  if (pathname === PATHS.admin.root) return 'home';
  for (const section of SECTIONS) {
    if (pathname === section.href || pathname.startsWith(`${section.href}/`)) return section.key;
  }
  return null;
}
