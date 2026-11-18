'use client';

import { SidebarTrigger, useSidebar } from '@/themes/neobrutal/ui/sidebar';

/** Opens the sidebar from the page header; only shown when the sidebar itself is not visible. */
export function SidebarToggle() {
  const { isMobile, state } = useSidebar();
  if (!isMobile && state === 'expanded') return null;
  return (
    <SidebarTrigger className="size-7 border-0 bg-transparent text-foreground/60 shadow-none hover:text-foreground" />
  );
}
