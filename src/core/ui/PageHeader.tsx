import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { SidebarToggle } from './SidebarToggle';

export function PageHeader({
  icon: Icon,
  title,
  crumbs,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  crumbs?: { href: string; label: string }[];
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border/10 px-3">
      <SidebarToggle />
      {crumbs?.map((crumb) => (
        <span key={crumb.href} className="inline-flex items-center gap-2 text-sm">
          <Link href={crumb.href} className="text-foreground/60 hover:text-foreground">
            {crumb.label}
          </Link>
          <span className="text-foreground/40">/</span>
        </span>
      ))}
      <Icon className="size-4" />
      <span className="mr-auto text-sm font-heading">{title}</span>
      {actions}
    </header>
  );
}
