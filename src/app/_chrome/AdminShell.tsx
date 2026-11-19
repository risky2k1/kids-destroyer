import type { CSSProperties, ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from '@/themes/neobrutal/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export function AdminShell({
  userName,
  siteName,
  children,
}: {
  userName: string;
  siteName: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider
      className={`theme-blue h-dvh overflow-hidden border-2 border-border bg-secondary-background ${hardShadow}`}
      style={{ '--sidebar-width': '13.5rem' } as CSSProperties}
    >
      <AdminSidebar userName={userName} siteName={siteName} />
      <SidebarInset className="min-w-0 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
