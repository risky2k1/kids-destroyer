import type { CSSProperties, ReactNode } from 'react';
import type { Principal } from '@/core/acl/access';
import { SidebarInset, SidebarProvider } from '@/themes/neobrutal/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export function AdminShell({
  userName,
  siteName,
  logoUrl,
  principal,
  roleName,
  children,
}: {
  userName: string;
  siteName: string;
  logoUrl?: string | null;
  principal: Principal;
  roleName: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider
      className={`theme-blue h-dvh overflow-hidden border-2 border-border bg-secondary-background ${hardShadow}`}
      style={{ '--sidebar-width': '13.5rem' } as CSSProperties}
    >
      <AdminSidebar
        userName={userName}
        siteName={siteName}
        logoUrl={logoUrl}
        principal={principal}
        roleName={roleName}
      />
      <SidebarInset className="min-w-0 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
