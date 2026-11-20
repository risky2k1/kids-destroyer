import type { ComponentType } from 'react';

export type NavGroupId = 'content' | 'users' | 'system';

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: 'content', label: 'Nội dung' },
  { id: 'users', label: 'Người dùng' },
  { id: 'system', label: 'Hệ thống' },
];

export type NavLink = {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Literal Tailwind class (e.g. 'text-chart-5') so the scanner sees it. */
  iconClass: string;
};
export type NavParent = Omit<NavLink, 'href'> & { children: NavLink[] };
export type NavItem = NavLink | NavParent;

export type ModuleManifest = {
  id: string;
  name: string;
  nav: (NavItem & { group: NavGroupId })[];
};

export type NavSection = { id: NavGroupId; label: string; items: NavItem[] };

/** Groups in NAV_GROUPS order, items in module order; empty groups dropped. */
export function buildNav(modules: ModuleManifest[]): NavSection[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: modules.flatMap((m) => m.nav.filter((item) => item.group === group.id)),
  })).filter((section) => section.items.length > 0);
}

export function isParent(item: NavItem): item is NavParent {
  return 'children' in item;
}

/** Key of the link whose href equals pathname or is its prefix at a segment boundary. */
export function activeKey(pathname: string, sections: NavSection[]): string | null {
  for (const section of sections)
    for (const item of section.items)
      for (const link of isParent(item) ? item.children : [item])
        if (pathname === link.href || pathname.startsWith(`${link.href}/`)) return link.key;
  return null;
}
