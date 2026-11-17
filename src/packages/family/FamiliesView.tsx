import Link from 'next/link';
import { PATHS } from '@/core/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { FamilyNameForm } from './components/FamilyNameForm';
import { listFamilies } from './queries';

export async function FamiliesView() {
  const families = await listFamilies();
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Gia đình</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {families.length === 0 && <p>Chưa có gia đình nào.</p>}
        {families.map((f) => (
          <Link
            key={f.id}
            href={PATHS.admin.family(f.id)}
            className="rounded-base border-border bg-secondary-background shadow-shadow border-2 p-3 font-bold"
          >
            {f.name} →
          </Link>
        ))}
        <FamilyNameForm />
      </CardContent>
    </Card>
  );
}
