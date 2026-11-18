import Link from 'next/link';
import { Button } from '@/themes/neobrutal/ui/button';

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      render={<Link href={href} />}
      nativeButton={false}
      variant="neutral"
      size="sm"
      className="w-fit"
    >
      ← {label}
    </Button>
  );
}
