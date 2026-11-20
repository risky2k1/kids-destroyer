export const SXS_PATHS = {
  characters: '/admin/sxs',
  tab: (id: string, tab: StudioTab) => `/admin/sxs/c/${id}/${tab}`,
} as const;

export const PATHS = SXS_PATHS;

export const STUDIO_TABS = [
  'overview',
  'skills',
  'equipment',
  'resources',
  'companions',
  'prompt',
] as const;

export type StudioTab = (typeof STUDIO_TABS)[number];

export function tabFromPath(path: string): StudioTab {
  return STUDIO_TABS.find((tab) => path.endsWith(`/${tab}`)) ?? 'overview';
}
