import Link from 'next/link';
import { signOut } from '@/app/(auth)/login/actions';
import { Button } from '@/themes/neobrutal/ui/button';

type NavItem = { href: string; label: string };

export function AppHeader({
  title,
  nav,
  userName,
}: {
  title: string;
  nav: NavItem[];
  userName: string;
}) {
  return (
    <header className="border-border bg-secondary-background flex flex-wrap items-center gap-3 border-b-2 p-3">
      <span className="text-lg font-bold">{title}</span>
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
      <span className="ml-auto text-sm">{userName}</span>
      <form action={signOut}>
        <Button type="submit" variant="neutral" size="sm">
          Đăng xuất
        </Button>
      </form>
    </header>
  );
}
