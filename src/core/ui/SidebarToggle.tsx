'use client';

import { SidebarTrigger, useSidebarOptional } from '@/themes/neobrutal/ui/sidebar';

/** Opens the sidebar from the page header; hidden when there is no sidebar, or when it is already open. */
export function SidebarToggle() {
  const sidebar = useSidebarOptional();
  if (!sidebar || (!sidebar.isMobile && sidebar.state === 'expanded')) return null;
  return (
    <SidebarTrigger className="size-7 border-0 bg-transparent text-foreground/60 shadow-none hover:text-foreground" />
  );
}
