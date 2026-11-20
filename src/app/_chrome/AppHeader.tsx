import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/login/actions';
import { Button } from '@/themes/neobrutal/ui/button';
import { BrandMark } from './BrandMark';

type NavItem = { href: string; label: string };

export function AppHeader({
  title,
  nav = [],
  userName,
  logoUrl,
  siteName,
  right,
}: {
  title: ReactNode;
  nav?: NavItem[];
  userName?: string;
  logoUrl?: string | null;
  siteName?: string;
  right?: ReactNode;
}) {
  const showMark = logoUrl !== undefined || siteName !== undefined;
  return (
    <header className="border-border bg-secondary-background flex flex-wrap items-center gap-3 border-b-2 p-3">
      {showMark && <BrandMark logoUrl={logoUrl} siteName={siteName} size={7} />}
      {typeof title === 'string' ? <span className="text-lg font-bold">{title}</span> : title}
      {nav.length > 0 && (
        <nav className="flex flex-wrap gap-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-base px-2 py-1 font-bold hover:underline"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="ml-auto flex items-center gap-3">
        {userName && <span className="text-sm">{userName}</span>}
        {userName && (
          <form action={signOut}>
            <Button type="submit" variant="neutral" size="sm">
              Đăng xuất
            </Button>
          </form>
        )}
        {right}
      </div>
    </header>
  );
}
