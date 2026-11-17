import Link from 'next/link';
import { PATHS } from '@/core/routes';
import { Card, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';

const LINKS = [
  { href: PATHS.admin.catalog, label: 'Môn, lớp, chủ đề' },
  { href: PATHS.admin.families, label: 'Gia đình, phụ huynh, các bé' },
];

export default function AdminHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href}>
          <Card>
            <CardHeader>
              <CardTitle>{l.label}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
